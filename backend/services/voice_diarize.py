from __future__ import annotations

import subprocess
import wave
from pathlib import Path

import yt_dlp

from ..config import MEDIA_DIR
from . import media, youtube

# Heavy numeric deps are imported lazily so the app still boots without them.

def available() -> tuple[bool, str]:
    try:
        import numpy  # noqa: F401
        import sklearn  # noqa: F401
        from python_speech_features import mfcc  # noqa: F401
    except Exception as exc:  # pragma: no cover
        return False, (
            "Thiếu thư viện phân tích giọng. Cài bằng: "
            'pip install numpy scipy scikit-learn python_speech_features. '
            f"(chi tiết: {type(exc).__name__})"
        )
    if not media.ensure_ffmpeg():
        return False, "Không tìm thấy ffmpeg để giải mã âm thanh."
    return True, ""

def _download_audio(video_id: str) -> Path:
    out_tmpl = str(MEDIA_DIR / f"diar_{video_id}.%(ext)s")
    opts = {
        "format": "bestaudio/best",
        "outtmpl": out_tmpl,
        "quiet": True,
        "no_warnings": True,
        "overwrites": True,
    }
    if youtube.proxy():
        opts["proxy"] = youtube.proxy()
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
        return Path(ydl.prepare_filename(info))

def _to_wav(src: Path, dst: Path) -> None:
    ff = media.ensure_ffmpeg() or "ffmpeg"
    subprocess.run(
        [ff, "-i", str(src), "-ar", "16000", "-ac", "1", "-y", str(dst)],
        check=True, capture_output=True,
    )

def _read_wav(path: Path):
    import numpy as np
    with wave.open(str(path), "rb") as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        sw = w.getsampwidth()
        raw = w.readframes(w.getnframes())
    dtype = {1: np.int8, 2: np.int16, 4: np.int32}.get(sw, np.int16)
    a = np.frombuffer(raw, dtype=dtype).astype(np.float32)
    if ch > 1:
        a = a.reshape(-1, ch).mean(axis=1)
    peak = float(np.iinfo(dtype).max) or 1.0
    return sr, a / peak

def _pitch_hz(sig, sr, fmin: float = 70.0, fmax: float = 400.0) -> float:
    import numpy as np
    frame = int(0.04 * sr)
    hop = int(0.02 * sr)
    if len(sig) < frame:
        return 0.0
    lo, hi = int(sr / fmax), int(sr / fmin)
    vals = []
    for st in range(0, len(sig) - frame, hop):
        fr = sig[st:st + frame]
        if np.sqrt(np.mean(fr * fr)) < 0.01:
            continue
        fr = fr - fr.mean()
        ac = np.correlate(fr, fr, "full")[frame - 1:]
        if len(ac) <= hi or ac[0] <= 0:
            continue
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.3 * ac[0]:
            vals.append(sr / lag)
    return float(np.median(vals)) if vals else 0.0

def _segment_feature(sig, sr):
    import numpy as np
    from python_speech_features import mfcc
    if len(sig) < int(0.2 * sr):
        return None
    feats = mfcc(sig, samplerate=sr, numcep=13, nfft=1024)
    if feats.shape[0] < 2:
        return None
    pitch = _pitch_hz(sig, sr)
    logp = np.log(pitch) if pitch > 0 else 0.0
    return np.concatenate([feats.mean(axis=0), feats.std(axis=0), [logp]])

def _windows(starts: list[float], total: float):
    spans = []
    for i, s in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else s + 4.0
        a = s + 0.05
        b = min(end - 0.05, s + 6.0, total)
        if b - a < 0.6:
            b = min(a + 0.8, total)
        spans.append((max(0.0, a), max(0.0, b)))
    return spans

def diarize(video_id: str, starts: list[float]) -> dict:
    import numpy as np
    from sklearn.cluster import AgglomerativeClustering
    from sklearn.metrics import silhouette_score
    from sklearn.preprocessing import StandardScaler

    n = len(starts)
    if n == 0:
        return {"speakers": [], "names": [], "source": "voice", "k": 0}

    src = _download_audio(video_id)
    wav = MEDIA_DIR / f"diar_{video_id}.wav"
    try:
        _to_wav(src, wav)
        sr, sig = _read_wav(wav)
    finally:
        for p in (src, wav):
            try:
                if p.exists() and p != wav:
                    p.unlink()
            except Exception:
                pass

    total = len(sig) / sr
    spans = _windows([float(s) for s in starts], total)
    feats, idx = [], []
    for i, (a, b) in enumerate(spans):
        seg = sig[int(a * sr):int(b * sr)]
        f = _segment_feature(seg, sr)
        if f is not None:
            feats.append(f)
            idx.append(i)
    try:
        wav.unlink()
    except Exception:
        pass

    if len(feats) < 2:
        return {"speakers": [i % 2 for i in range(n)], "names": ["Người nói A", "Người nói B"], "source": "voice", "k": 2}

    X = StandardScaler().fit_transform(np.array(feats))
    X[:, -1] *= 4.0  # emphasise pitch (the strongest speaker cue)

    best_k, best_labels, best_score = 1, np.zeros(len(X), dtype=int), -1.0
    for k in range(2, min(6, len(X) - 1) + 1):
        labels = AgglomerativeClustering(n_clusters=k).fit_predict(X)
        score = silhouette_score(X, labels)
        if score > best_score:
            best_k, best_labels, best_score = k, labels, score
    if best_score < 0.12:
        best_k, best_labels = 1, np.zeros(len(X), dtype=int)

    # Map clustered (subset) labels back onto every segment via nearest analysed line.
    full = [0] * n
    for pos, seg_i in enumerate(idx):
        full[seg_i] = int(best_labels[pos])
    for i in range(n):
        if i not in idx:
            nearest = min(idx, key=lambda j: abs(j - i))
            full[i] = full[nearest]

    order, remap = [], {}
    for v in full:
        if v not in remap:
            remap[v] = len(order)
            order.append(v)
    full = [remap[v] for v in full]
    names = [f"Người nói {chr(65 + c)}" for c in range(len(order))]
    return {"speakers": full, "names": names, "source": "voice", "k": best_k}
