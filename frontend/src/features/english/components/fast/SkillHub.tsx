import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import {
  SKILLS, STAGES, LISTEN_SPLIT, WEEK_MINUTES_PRESETS,
  fmtMinutes, stageOf,
  type SkillId,
} from '@/data/englishFast'
import { useFast } from '../../fast'
import ReadingLab from './ReadingLab'
import WritingLab from './WritingLab'

type Pane = 'budget' | 'listen' | 'read' | 'write'

const PANES: { id: Pane; label: string; icon: 'chart' | 'headphones' | 'book' | 'note' }[] = [
  { id: 'budget', label: 'Ngân sách tuần', icon: 'chart' },
  { id: 'listen', label: 'Nghe', icon: 'headphones' },
  { id: 'read', label: 'Đọc', icon: 'book' },
  { id: 'write', label: 'Viết', icon: 'note' },
]

const QUICK = [10, 15, 30]

function Ring({ pct, tone }: { pct: number; tone: string }) {
  const r = 26
  const c = 2 * Math.PI * r
  const on = Math.min(100, pct)
  return (
    <svg className="skill-ring" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="ring-bg" />
      <circle
        cx="32" cy="32" r={r}
        className={'ring-on ' + tone}
        strokeDasharray={`${(c * on) / 100} ${c}`}
        transform="rotate(-90 32 32)"
      />
    </svg>
  )
}

export default function SkillHub() {
  const { setView } = useAppStore()
  const [pane, setPane] = useState<Pane>('budget')
  const { fast, week, streakDays, undoable, setStage, setWeekMins, logSkill, undoSkill } = useFast()

  const stage = stageOf(fast.stage)
  const pctOf = (id: SkillId) => (week.target[id] ? Math.round((week.done[id] / week.target[id]) * 100) : 0)
  const totalPct = week.totalTarget ? Math.round((week.totalDone / week.totalTarget) * 100) : 0

  return (
    <div className="skill-hub">
      <div className="skill-panes" role="tablist">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'skill-pane-btn' + (pane === p.id ? ' on' : '')}
            onClick={() => setPane(p.id)}
          >
            <Icon name={p.icon} size={15} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'budget' && (
        <>
          <div className="skill-stage">
            <div className="skill-stage-head">
              <b>Bạn đang ở đâu?</b>
              <small>Tỉ lệ chia giờ khác nhau theo trình độ — chọn sai thì luyện nhiều vẫn ì.</small>
            </div>
            <div className="skill-stage-pick">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  className={'skill-stage-card' + (fast.stage === s.id ? ' on' : '')}
                  onClick={() => setStage(s.id)}
                >
                  <div className="ssc-head"><b>{s.name}</b><span>{s.range}</span></div>
                  <div className="ssc-bar">
                    {SKILLS.map((sk) => (
                      <i key={sk.id} className={sk.tone} style={{ width: `${s.budget[sk.id]}%` }} />
                    ))}
                  </div>
                  <p>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="skill-total">
            <div className="skill-total-l">
              <b>Ngân sách mỗi tuần</b>
              <div className="skill-mins">
                {WEEK_MINUTES_PRESETS.map((m) => (
                  <button
                    key={m}
                    className={'skill-min' + (fast.weekMins === m ? ' on' : '')}
                    onClick={() => setWeekMins(m)}
                  >
                    {fmtMinutes(m)}
                    <small>{Math.round(m / 7)} phút/ngày</small>
                  </button>
                ))}
              </div>
              <label className="skill-custom">
                Hoặc tự đặt:
                <input
                  type="number"
                  min={30}
                  max={3000}
                  step={30}
                  value={fast.weekMins}
                  onChange={(e) => setWeekMins(Number(e.target.value) || 300)}
                />
                phút/tuần
              </label>
            </div>
            <div className="skill-total-r">
              <div className="skill-total-num">
                <b>{totalPct}%</b>
                <span>{fmtMinutes(week.totalDone)} / {fmtMinutes(week.totalTarget)}</span>
              </div>
              <div className="skill-total-bar"><i style={{ width: `${Math.min(100, totalPct)}%` }} /></div>
              {streakDays > 0 && (
                <div className="skill-streak"><Icon name="flame" size={14} /> {streakDays} ngày liên tiếp</div>
              )}
            </div>
          </div>

          <div className="skill-grid">
            {SKILLS.map((sk) => {
              const pct = pctOf(sk.id)
              const done = week.done[sk.id]
              const target = week.target[sk.id]
              return (
                <div key={sk.id} className={'skill-card' + (pct >= 100 ? ' full' : '')}>
                  <div className="skill-card-top">
                    <div className="skill-ring-wrap">
                      <Ring pct={pct} tone={sk.tone} />
                      <span className="skill-ring-num">{pct}%</span>
                    </div>
                    <div className="skill-card-id">
                      <b><Icon name={sk.icon} size={15} /> {sk.name}</b>
                      <span>{stage.budget[sk.id]}% ngân sách</span>
                    </div>
                  </div>
                  <div className="skill-card-mins">
                    <b>{fmtMinutes(done)}</b> / {fmtMinutes(target)} tuần này
                  </div>
                  <p>{sk.hint}</p>
                  <div className="skill-log">
                    {QUICK.map((m) => (
                      <button key={m} className="skill-log-btn" onClick={() => logSkill(sk.id, m)}>
                        +{m}′
                      </button>
                    ))}
                    {undoable[sk.id] > 0 && (
                      <button
                        className="skill-log-undo"
                        onClick={() => undoSkill(sk.id)}
                        title={`Hoàn tác lần ghi cuối (−${undoable[sk.id]} phút)`}
                      >
                        <Icon name="refresh" size={13} /> −{undoable[sk.id]}′
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="skill-note">
            <Icon name="bulb" size={16} />
            <span>
              Ghi giờ ngay sau mỗi buổi, đừng nhớ dồn cuối tuần. Vòng tròn nào tụt lại là bạn đang né kỹ năng đó —
              và đúng chỗ né mới là chỗ cần luyện. Tuần mới tự bắt đầu vào thứ Hai.
            </span>
          </div>
        </>
      )}

      {pane === 'listen' && (
        <div className="listen-pane">
          <div className="listen-head">
            <b>Ngân sách nghe tuần này: {fmtMinutes(week.target.listen)}</b>
            <small>Chia tiếp thành 5 việc. Mỗi việc rèn một cơ khác nhau của tai.</small>
          </div>
          <div className="listen-list">
            {LISTEN_SPLIT.map((l) => {
              const mins = Math.round((week.target.listen * l.pct) / 100)
              return (
                <div key={l.id} className="listen-item">
                  <div className="listen-pct"><b>{l.pct}%</b><span>{fmtMinutes(mins)}</span></div>
                  <div className="listen-body">
                    <b>{l.label}</b>
                    <p>{l.desc}</p>
                  </div>
                  <div className="listen-act">
                    {l.view && (
                      <button className="btn-ghost sm" onClick={() => setView(l.view!)}>
                        {l.cta} <Icon name="arrow-right" size={13} />
                      </button>
                    )}
                    <button className="skill-log-btn" onClick={() => logSkill('listen', 15)}>+15′</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="skill-note">
            <Icon name="bulb" size={16} />
            <span>
              Ba việc đầu (vừa đọc vừa nghe, nhại theo, chép chính tả) làm ngay trên trang xem video:
              mở một video trong kho rồi chuyển tab bên phải. Việc thứ tư mở ở trang Luyện nói.
            </span>
          </div>
        </div>
      )}

      {pane === 'read' && <ReadingLab onLog={(m) => logSkill('read', m)} />}
      {pane === 'write' && <WritingLab onLog={(m) => logSkill('write', m)} />}
    </div>
  )
}
