import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { speakEN } from '@/core/tts'
import { ERROR_KINDS, FEEDBACK_LOOP } from '@/data/englishFast'
import { ERROR_FIXED_TARGET, openErrors, useFast } from '../../fast'

type Filter = 'open' | 'fixed' | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'open', label: 'Đang sửa' },
  { id: 'fixed', label: 'Đã chữa xong' },
  { id: 'all', label: 'Tất cả' },
]

function daysAgo(at: string): string {
  const then = new Date(at + 'T00:00:00').getTime()
  if (Number.isNaN(then)) return ''
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return 'hôm nay'
  if (days === 1) return 'hôm qua'
  return `${days} ngày trước`
}

export default function ErrorLog() {
  const { setView } = useAppStore()
  const { fast, addError, hitError, resetError, dropError } = useFast()
  const [kind, setKind] = useState(ERROR_KINDS[0].id)
  const [wrong, setWrong] = useState('')
  const [right, setRight] = useState('')
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState<Filter>('open')

  const list = useMemo(() => {
    if (filter === 'open') return openErrors(fast.errors)
    if (filter === 'fixed') return fast.errors.filter((e) => e.fixed >= ERROR_FIXED_TARGET)
    return fast.errors
  }, [fast.errors, filter])

  const openCount = fast.errors.filter((e) => e.fixed < ERROR_FIXED_TARGET).length
  const fixedCount = fast.errors.length - openCount

  const byKind = useMemo(() => {
    const m: Record<string, number> = {}
    for (const e of fast.errors) {
      if (e.fixed < ERROR_FIXED_TARGET) m[e.kind] = (m[e.kind] ?? 0) + 1
    }
    return m
  }, [fast.errors])

  const worst = useMemo(() => {
    let top = ''
    let n = 0
    for (const [k, v] of Object.entries(byKind)) {
      if (v > n) { top = k; n = v }
    }
    return top ? ERROR_KINDS.find((x) => x.id === top) ?? null : null
  }, [byKind])

  const focus3 = useMemo(() => openErrors(fast.errors).slice(0, 3), [fast.errors])

  const submit = () => {
    if (!wrong.trim() || !right.trim()) return
    addError(kind, wrong.trim(), right.trim(), note.trim())
    setWrong('')
    setRight('')
    setNote('')
  }

  return (
    <div className="errlog">
      <div className="read-intro">
        <Icon name="bell" size={18} />
        <div>
          <b>Chữ T của F.A.S.T — phản hồi kịp thời.</b> Lỗi không được sửa sớm sẽ <b>hoá thạch</b>: lặp đủ lâu
          thì nó thành phản xạ, và sửa một phản xạ tốn gấp nhiều lần so với học đúng ngay từ đầu.
          Sổ này là nơi bạn bắt lỗi lại trước khi kịp quên.
        </div>
      </div>

      <div className="errlog-loop">
        {FEEDBACK_LOOP.map((s) => (
          <div key={s.n} className="errlog-loop-step">
            <b>{s.n}</b>
            <div><h4>{s.title}</h4><p>{s.desc}</p></div>
          </div>
        ))}
      </div>

      <div className="errlog-cols">
        <div className="errlog-add">
          <div className="write-h">Ghi một lỗi mới</div>
          <div className="errlog-kinds">
            {ERROR_KINDS.map((k) => (
              <button
                key={k.id}
                className={'errlog-kind ' + k.tone + (kind === k.id ? ' on' : '')}
                onClick={() => setKind(k.id)}
                title={k.hint}
              >
                <Icon name={k.icon} size={14} /> {k.label}
              </button>
            ))}
          </div>
          <p className="errlog-hint">{ERROR_KINDS.find((k) => k.id === kind)?.hint}</p>

          <label className="errlog-field">
            <span>Bạn đã nói/viết sai thế nào?</span>
            <input value={wrong} onChange={(e) => setWrong(e.target.value)} placeholder="I go to school yesterday" maxLength={200} />
          </label>
          <label className="errlog-field">
            <span>Câu đúng là gì?</span>
            <input
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="I went to school yesterday"
              maxLength={200}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            />
          </label>
          <label className="errlog-field">
            <span>Ghi chú <i>(không bắt buộc)</i></span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quên chia quá khứ khi có 'yesterday'" maxLength={200} />
          </label>
          <button className="btn-primary sm" disabled={!wrong.trim() || !right.trim()} onClick={submit}>
            <Icon name="plus" size={15} /> Thêm vào sổ
          </button>

          <div className="errlog-sources">
            <div className="write-h">Bắt lỗi ở đâu?</div>
            <button className="btn-ghost sm" onClick={() => setView('speaking')}>
              <Icon name="mic" size={14} /> AI sửa câu khi bạn nói
            </button>
            <button className="btn-ghost sm" onClick={() => setView('library')}>
              <Icon name="headphones" size={14} /> Chép chính tả — chỗ chép sai là chỗ tai thủng
            </button>
          </div>
        </div>

        <div className="errlog-list-col">
          <div className="errlog-stats">
            <div className="errlog-stat"><b>{openCount}</b><span>đang sửa</span></div>
            <div className="errlog-stat good"><b>{fixedCount}</b><span>đã chữa xong</span></div>
            {worst && (
              <div className="errlog-stat warn">
                <b>{worst.label}</b><span>nhóm lỗi nhiều nhất</span>
              </div>
            )}
          </div>

          {focus3.length > 0 && (
            <div className="errlog-focus">
              <div className="write-h"><Icon name="target" size={15} /> Ba lỗi cần chữa dứt điểm tuần này</div>
              <p>
                Đây là ba lỗi nằm trong sổ lâu nhất mà chưa chữa xong — càng để lâu càng khó gỡ.
                Nói lại đúng {ERROR_FIXED_TARGET} lần thì lỗi được đóng sổ. Đừng ôm nhiều hơn ba.
              </p>
              <ol>
                {focus3.map((e) => (
                  <li key={e.id}>
                    <b>{e.right}</b>
                    <span className="errlog-age">{daysAgo(e.at)}</span>
                    <span className="errlog-progress">
                      {Array.from({ length: ERROR_FIXED_TARGET }, (_, i) => (
                        <i key={i} className={i < e.fixed ? 'on' : ''} />
                      ))}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="errlog-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={'errlog-filter' + (filter === f.id ? ' on' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!list.length ? (
            <div className="errlog-empty">
              <Icon name="note" size={28} />
              <b>{fast.errors.length ? 'Không có lỗi nào ở mục này.' : 'Sổ còn trống.'}</b>
              <p>
                {fast.errors.length
                  ? 'Chuyển bộ lọc để xem các lỗi khác.'
                  : 'Lần tới bị AI sửa câu hoặc bị chấm phát âm thấp, ghi ngay vào đây trong vòng một phút. Trí nhớ không đáng tin bằng một dòng chữ.'}
              </p>
            </div>
          ) : (
            <div className="errlog-items">
              {list.map((e) => {
                const k = ERROR_KINDS.find((x) => x.id === e.kind) ?? ERROR_KINDS[0]
                const done = e.fixed >= ERROR_FIXED_TARGET
                return (
                  <div key={e.id} className={'errlog-item' + (done ? ' done' : '')}>
                    <div className="errlog-item-top">
                      <span className={'errlog-tag ' + k.tone}><Icon name={k.icon} size={12} /> {k.label}</span>
                      <span className="errlog-date">{e.at} · {daysAgo(e.at)}</span>
                      <button className="errlog-x" onClick={() => dropError(e.id)} title="Xoá khỏi sổ">
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                    <p className="errlog-wrong"><Icon name="x-circle" size={14} /> {e.wrong}</p>
                    <p className="errlog-right">
                      <Icon name="check-circle" size={14} /> {e.right}
                      <button className="errlog-say" onClick={() => speakEN(e.right)}><Icon name="volume" size={13} /></button>
                    </p>
                    {e.note && <p className="errlog-note">{e.note}</p>}
                    <div className="errlog-item-foot">
                      <span className="errlog-progress">
                        {Array.from({ length: ERROR_FIXED_TARGET }, (_, i) => (
                          <i key={i} className={i < e.fixed ? 'on' : ''} />
                        ))}
                      </span>
                      {done ? (
                        <button className="btn-ghost sm" onClick={() => resetError(e.id)}>
                          <Icon name="refresh" size={13} /> Mở lại
                        </button>
                      ) : (
                        <button className="btn-primary sm" onClick={() => hitError(e.id)}>
                          <Icon name="check" size={13} /> Vừa nói đúng
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
