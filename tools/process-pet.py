import sys, os, re, glob, shutil, subprocess
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAXDIM = 320
BG_TOL = 42
FRINGE = 96

RULES = [
    ('cuoinhaymat', 'wink'), ('nhaymat', 'wink'), ('wink', 'wink'),
    ('mattraitim', 'love'), ('traitim', 'love'), ('love', 'love'),
    ('buonngu', 'sleepy'), ('sleepy', 'sleepy'), ('ngap', 'sleepy'), ('yawn', 'sleepy'),
    ('docsach', 'reading'), ('reading', 'reading'), ('read', 'reading'), ('doc', 'reading'), ('sach', 'reading'), ('book', 'reading'),
    ('ngaingung', 'shy'), ('shy', 'shy'),
    ('ngongac', 'confused'), ('confused', 'confused'),
    ('sohai', 'scared'), ('scared', 'scared'),
    ('ngu', 'sleep'), ('sleep', 'sleep'), ('zzz', 'sleep'),
    ('cuoi', 'happy'), ('happy', 'happy'), ('smile', 'happy'), ('default', 'happy'),
]


def mood_of(name):
    n = name.lower()
    for key, mood in RULES:
        if key in n:
            return mood
    return None


def border_color(px, w, h):
    rs, gs, bs = [], [], []
    for x in range(w):
        for y in (0, 1, h - 2, h - 1):
            r, g, b = px[x, y][:3]
            rs.append(r); gs.append(g); bs.append(b)
    for y in range(h):
        for x in (0, 1, w - 2, w - 1):
            r, g, b = px[x, y][:3]
            rs.append(r); gs.append(g); bs.append(b)
    rs.sort(); gs.sort(); bs.sort()
    m = len(rs) // 2
    return (rs[m], gs[m], bs[m])


def remove_bg(im):
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    bg = border_color(px, w, h)

    def diff(c):
        return max(abs(c[0] - bg[0]), abs(c[1] - bg[1]), abs(c[2] - bg[2]))

    isbg = bytearray(w * h)
    dq = deque()

    def push(x, y):
        i = y * w + x
        if not isbg[i] and diff(px[x, y]) <= BG_TOL:
            isbg[i] = 1
            dq.append((x, y))

    for x in range(w):
        push(x, 0); push(x, h - 1)
    for y in range(h):
        push(0, y); push(w - 1, y)
    while dq:
        x, y = dq.popleft()
        if x > 0: push(x - 1, y)
        if x < w - 1: push(x + 1, y)
        if y > 0: push(x, y - 1)
        if y < h - 1: push(x, y + 1)

    out = im.copy()
    op = out.load()
    for y in range(h):
        base = y * w
        for x in range(w):
            i = base + x
            r, g, b, a = px[x, y]
            if isbg[i]:
                op[x, y] = (r, g, b, 0)
                continue
            touch = ((x > 0 and isbg[i - 1]) or (x < w - 1 and isbg[i + 1])
                     or (y > 0 and isbg[i - w]) or (y < h - 1 and isbg[i + w]))
            if touch:
                d = diff((r, g, b))
                if d < FRINGE:
                    na = int(round(a * (d / FRINGE)))
                    if na < a:
                        op[x, y] = (r, g, b, na)
    return out


def find_ffmpeg():
    p = shutil.which('ffmpeg')
    if p:
        return p
    hits = glob.glob(os.path.expandvars(
        r'%LOCALAPPDATA%\Microsoft\WinGet\Packages\*FFmpeg*\*\bin\ffmpeg.exe'))
    return hits[0] if hits else None


def key_video(src, dst):
    ff = find_ffmpeg()
    if not ff:
        print('  ! Khong tim thay ffmpeg, bo qua video:', os.path.basename(src))
        return False
    tmp = Image.new('RGBA', (8, 8))
    probe = os.path.join(os.path.dirname(dst), '_probe.png')
    subprocess.run([ff, '-y', '-v', 'error', '-i', src, '-frames:v', '1', probe], check=True)
    with Image.open(probe) as fr:
        fr = fr.convert('RGBA')
        bg = border_color(fr.load(), *fr.size)
    os.remove(probe)
    hexbg = '0x%02x%02x%02x' % bg
    vf = f'colorkey={hexbg}:0.12:0.08,format=yuva420p'
    subprocess.run([ff, '-y', '-v', 'error', '-i', src, '-vf', vf,
                    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
                    '-b:v', '0', '-crf', '32', '-an', dst], check=True)
    return True


def main():
    if len(sys.argv) < 2:
        print('Dung: python tools/process-pet.py <art> [src]')
        sys.exit(1)
    art = sys.argv[1]
    src = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'frontend', 'pet-src', art)
    dst = os.path.join(ROOT, 'frontend', 'src', 'core', 'components', 'Pet', 'img', art)
    if not os.path.isdir(src):
        print('Khong tim thay folder anh:', src); sys.exit(1)
    os.makedirs(dst, exist_ok=True)

    seen = {}
    for f in sorted(glob.glob(os.path.join(src, '*'))):
        ext = os.path.splitext(f)[1].lower()
        base = os.path.splitext(os.path.basename(f))[0]
        mood = mood_of(base)
        if ext in ('.png', '.jpg', '.jpeg', '.webp'):
            if not mood:
                print('BO QUA (khong ro bieu cam):', os.path.basename(f)); continue
            if mood in seen:
                print(f"BO QUA (trung '{mood}'):", os.path.basename(f)); continue
            seen[mood] = True
            im = Image.open(f)
            scale = min(1.0, MAXDIM / max(im.size))
            if scale < 1.0:
                im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
            out = remove_bg(im)
            out.save(os.path.join(dst, mood + '.png'))
            print(f'{os.path.basename(f):22} -> {mood}.png  {out.width}x{out.height}')
        elif ext in ('.webm', '.mp4'):
            if not mood:
                print('BO QUA video (khong ro bieu cam):', os.path.basename(f)); continue
            outp = os.path.join(dst, mood + '.webm')
            if key_video(f, outp):
                print(f'{os.path.basename(f):22} -> {mood}.webm (da keo nen)')
    print('--- XONG:', art, '---')


if __name__ == '__main__':
    main()
