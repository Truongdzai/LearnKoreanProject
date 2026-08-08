import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { stopSpeak } from '@/core/tts'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import { analyzeClip, type ProsodyReport } from '@/core/utils/prosody'
import { pronWords, type PronGroup } from '@/data/englishPronunciation'
import { PRON_RUBRIC, rubricAdvice } from '@/data/pronMethod'
import { usePronLog } from '../../pronLog'
import { CTX } from './reader'

type Slot = 'a' | 'b'

interface Clip {
  url: string
  report: ProsodyReport | null
}

const EMPTY: Record<Slot, Clip | null> = { a: null, b: null }

function num(x: number, digits = 1): string {
  return x.toFixed(digits).replace('.', ',')
}

function trend(a: number, b: number, better: 'up' | 'down' | 'near'): string {
  const d = b - a
  if (Math.abs(d) < 0.05) return 'giữ nguyên'
  if (better === 'near') return d > 0 ? 'tăng' : 'giảm'
  const good = better === 'up' ? d > 0 : d < 0
  return (d > 0 ? 'tăng' : 'giảm') + (good ? ' ✓' : '')
}

export default function RecordStudio({ group, lang }: { group: PronGroup; lang: string }) {
  const clip = useVoiceClip()
  const { log, add, remove } = usePronLog(lang)

  const targets = useMemo(() => {
    const words = pronWords(group).slice(0, 6).map((w) => w.w)
    return [...group.sentences.map((s) => s.en), ...words]
  }, [group])

  const [target, setTarget] = useState(targets[0] ?? '')
  const [clips, setClips] = useState<Record<Slot, Clip | null>>(EMPTY)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [fix, setFix] = useState(PRON_RUBRIC[0].id)
  const [marks, setMarks] = useState<Record<string, boolean>>({})
  const [miss, setMiss] = useState('')
  const [act, setAct] = useState('')
  const [savedTs, setSavedTs] = useState(0)
  const audio = useRef<HTMLAudioElement | null>(null)

  const reset = useCallback(() => {
    setClips(EMPTY); setMarks({}); setMiss(''); setAct(''); setSavedTs(0)
  }, [])

  useEffect(() => { reset() }, [target, reset])

  const stopPlay = useCallback(() => {
    audio.current?.pause()
    audio.current = null
  }, [])

  useEffect(() => () => { stopPlay(); stopSpeak() }, [stopPlay])

  const play = useCallback((url: string, then?: () => void) => {
    stopPlay()
    stopSpeak()
    const el = new Audio(url)
    audio.current = el
    if (then) el.onended = then
    el.play().catch(() => { })
  }, [stopPlay])

  const playBoth = () => {
    const a = clips.a
    const b = clips.b
    if (!a || !b) return
    play(a.url, () => window.setTimeout(() => play(b.url), 450))
  }

  const record = (which: Slot) => {
    if (clip.recording) { clip.stop(); return }
    stopPlay(); stopSpeak()
    setSlot(which)
    setSavedTs(0)
    void clip.start((url) => {
      setSlot(null)
      if (!url) return
      setClips((prev) => ({ ...prev, [which]: { url, report: null } }))
      analyzeClip(url, 0)
        .then((report) => setClips((prev) => (prev[which]?.url === url ? { ...prev, [which]: { url, report } } : prev)))
        .catch(() => { })
    })
  }

  const score = PRON_RUBRIC.filter((r) => marks[r.id]).length
  const weakest = PRON_RUBRIC.filter((r) => !marks[r.id])
  const graded = Object.keys(marks).length > 0
  const fixLabel = PRON_RUBRIC.find((r) => r.id === fix)?.label ?? ''

  const save = () => {
    if (!target) return
    add({ group: group.title, target, fix: fixLabel, miss: miss.trim(), act: act.trim(), score })
    setSavedTs(Date.now())
  }

  if (!clip.supported) {
    return (
      <div className="pron-warn">
        <b><Icon name="mic" size={15} /> Trình duyệt này chưa ghi âm được</b>
        <p>Phần ghi âm cần MediaRecorder và quyền micro. Hãy mở bằng Chrome hoặc Edge trên máy tính, hoặc Chrome trên Android. Các phần còn lại vẫn dùng bình thường.</p>
      </div>
    )
  }

  return (
    <div className="pron-studio">
      <div className="pst-intro">
        <b><Icon name="mic" size={15} /> Ghi hai bản, bản sau chỉ sửa một chi tiết</b>
        <p>So sánh hai lần nói liên tiếp là cách nhanh nhất để biết thao tác nào thật sự làm bản ghi rõ hơn. Nếu sửa nhiều thứ cùng lúc, tai sẽ không xác định được thay đổi nào có tác dụng.</p>
      </div>

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">1</span> Chọn câu hoặc từ để luyện</div>
        <div className="pst-targets">
          {targets.map((tg) => (
            <button key={tg} className={'pst-target' + (tg === target ? ' on' : '')} onClick={() => setTarget(tg)} lang={CTX.lang}>
              {tg}
            </button>
          ))}
        </div>
        <button className="btn-ghost sm" onClick={() => CTX.speak(target, 0.8)}>
          <Icon name="volume" size={14} /> Nghe mẫu (chậm)
        </button>
      </div>

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">2</span> Ghi bản 1 — nói tự nhiên như bình thường</div>
        <div className="pst-take">
          <button className={'pron-mic big' + (slot === 'a' && clip.recording ? ' on' : '')} onClick={() => record('a')}>
            <Icon name="mic" size={24} />
          </button>
          <div className="pst-take-info">
            {slot === 'a' && clip.recording
              ? <b>Đang ghi… {clip.seconds}s</b>
              : clips.a ? <b>Đã có bản 1</b> : <b>Chưa ghi</b>}
            <span>Đọc trọn câu, đừng dừng giữa chừng.</span>
          </div>
          <button className="btn-ghost sm" disabled={!clips.a} onClick={() => clips.a && play(clips.a.url)}>
            <Icon name="play" size={14} /> Nghe bản 1
          </button>
        </div>
      </div>

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">3</span> Chọn MỘT chi tiết sẽ sửa ở bản 2</div>
        <div className="pst-fixes">
          {PRON_RUBRIC.map((r) => (
            <button key={r.id} className={'pst-fix' + (fix === r.id ? ' on' : '')} onClick={() => setFix(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <p className="pst-fixhint"><Icon name="bulb" size={13} /> {PRON_RUBRIC.find((r) => r.id === fix)?.fix}</p>
      </div>

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">4</span> Ghi bản 2 — chỉ đổi đúng chi tiết đó</div>
        <div className="pst-take">
          <button className={'pron-mic big' + (slot === 'b' && clip.recording ? ' on' : '')} onClick={() => record('b')} disabled={!clips.a}>
            <Icon name="mic" size={24} />
          </button>
          <div className="pst-take-info">
            {slot === 'b' && clip.recording
              ? <b>Đang ghi… {clip.seconds}s</b>
              : clips.b ? <b>Đã có bản 2</b> : <b>{clips.a ? 'Chưa ghi' : 'Ghi bản 1 trước đã'}</b>}
            <span>Giữ nguyên mọi thứ khác, chỉ sửa: {fixLabel.toLowerCase()}.</span>
          </div>
          <button className="btn-ghost sm" disabled={!clips.b} onClick={() => clips.b && play(clips.b.url)}>
            <Icon name="play" size={14} /> Nghe bản 2
          </button>
        </div>
        {clips.a && clips.b && (
          <button className="btn-primary sm pst-ab" onClick={playBoth}>
            <Icon name="refresh" size={14} /> Nghe liền bản 1 → bản 2
          </button>
        )}
      </div>

      {clips.a?.report && clips.b?.report && (
        <div className="pst-measure">
          <div className="pst-h"><Icon name="chart" size={14} /> Đo từ chính giọng bạn</div>
          <table className="pst-table">
            <thead>
              <tr><th>Chỉ số</th><th>Bản 1</th><th>Bản 2</th><th>Thay đổi</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Thời lượng</td>
                <td>{num(clips.a.report.speechSec)}s</td>
                <td>{num(clips.b.report.speechSec)}s</td>
                <td>{trend(clips.a.report.speechSec, clips.b.report.speechSec, 'near')}</td>
              </tr>
              <tr>
                <td>Chỗ ngắt giữa câu</td>
                <td>{clips.a.report.pauses.length}</td>
                <td>{clips.b.report.pauses.length}</td>
                <td>{trend(clips.a.report.pauses.length, clips.b.report.pauses.length, 'down')}</td>
              </tr>
              <tr>
                <td>Quãng giọng (nửa cung)</td>
                <td>{num(clips.a.report.rangeSt)}</td>
                <td>{num(clips.b.report.rangeSt)}</td>
                <td>{trend(clips.a.report.rangeSt, clips.b.report.rangeSt, 'up')}</td>
              </tr>
            </tbody>
          </table>
          <p className="pst-note">Máy chỉ đo thời lượng, khoảng lặng và độ lên xuống của giọng — phần đúng sai của âm vẫn do tai bạn quyết định ở bước dưới. Tiếng của bạn không được gửi đi đâu cả.</p>
        </div>
      )}

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">5</span> Tự chấm bản 2 — mỗi tiêu chí đạt được 1 điểm</div>
        <ul className="pst-rubric">
          {PRON_RUBRIC.map((r) => (
            <li key={r.id}>
              <label>
                <input type="checkbox" checked={!!marks[r.id]} onChange={(e) => setMarks((m) => ({ ...m, [r.id]: e.target.checked }))} />
                <span><b>{r.label}</b> — {r.q}</span>
              </label>
            </li>
          ))}
        </ul>
        {graded && (
          <div className={'pst-score' + (score >= 5 ? ' good' : score >= 3 ? ' mid' : ' low')}>
            <b>{score}/5</b>
            <span>{rubricAdvice(score)}</span>
          </div>
        )}
        {graded && weakest.length > 0 && (
          <p className="pst-fixhint"><Icon name="target" size={13} /> Lượt sau nên nhắm vào: {weakest.map((r) => r.label).join(', ')}.</p>
        )}
        <p className="pst-note">Chấm bằng tai nghe ở âm lượng vừa phải và chỉ dùng bằng chứng nghe được trong bản ghi.</p>
      </div>

      <div className="pst-block">
        <div className="pst-h"><span className="pst-n">6</span> Nhật ký sửa lỗi</div>
        <div className="pst-auto">
          <div><small>Âm đã luyện</small><b>{group.title}</b></div>
          <div><small>Từ và câu đã dùng</small><b lang={CTX.lang}>{target}</b></div>
        </div>
        <label className="pst-field">
          <small>Lỗi nghe thấy trong bản đầu</small>
          <input value={miss} onChange={(e) => setMiss(e.target.value)} maxLength={140} placeholder="Ví dụ: mất âm /t/ cuối từ khi nói nhanh" />
        </label>
        <label className="pst-field">
          <small>Thao tác làm bản sau rõ hơn</small>
          <input value={act} onChange={(e) => setAct(e.target.value)} maxLength={140} placeholder="Ví dụ: đóng lưỡi ở lợi rồi dừng, không thêm âm ờ" />
        </label>
        <div className="pst-saverow">
          <button className="btn-primary sm" onClick={save} disabled={!target}>
            <Icon name="check" size={14} /> Lưu vào nhật ký
          </button>
          {savedTs > 0 && <span className="pst-saved"><Icon name="check-circle" size={14} /> Đã lưu</span>}
        </div>
      </div>

      {log.entries.length > 0 && (
        <div className="pst-log">
          <div className="pst-h"><Icon name="note" size={14} /> Đã ghi {log.entries.length} buổi</div>
          <ul>
            {log.entries.slice(0, 8).map((e) => (
              <li key={e.ts}>
                <div className="pst-log-top">
                  <b>{e.group}</b>
                  <span className="pst-log-score">{e.score}/5</span>
                  <span className="pst-log-date">{new Date(e.ts).toLocaleDateString('vi-VN')}</span>
                  <button className="pst-del" onClick={() => remove(e.ts)} title="Xoá dòng này">
                    <Icon name="x-circle" size={14} />
                  </button>
                </div>
                <small lang={CTX.lang}>{e.target}</small>
                {e.fix && <small>Sửa: {e.fix}</small>}
                {e.miss && <small>Lỗi bản đầu: {e.miss}</small>}
                {e.act && <small>Thao tác hiệu quả: {e.act}</small>}
              </li>
            ))}
          </ul>
          <p className="pst-note">Nhật ký ngắn giúp bạn nhận ra quy luật của riêng mình: có người mất âm cuối khi tăng tốc, có người đọc đúng trong từ đơn nhưng lệch khi vào câu.</p>
        </div>
      )}
    </div>
  )
}
