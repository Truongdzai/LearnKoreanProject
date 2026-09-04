import { useMemo } from 'react'
import Icon from '@/core/components/Icon'
import { TOEIC_TARGET } from '@/data/toeicCore'
import { skillStats, weakestSkills, type SkillStat } from '../engine'
import type { ToeicAttempt } from '../state'

interface Props {
  attempts: ToeicAttempt[]
  onWeak: (n: number) => void
  onMiniTest: () => void
}

const GROUP_LABEL: Record<SkillStat['group'], string> = {
  listening: 'Kỹ năng nghe',
  grammar: 'Ngữ pháp & từ vựng',
  reading: 'Đọc hiểu',
}

export default function SkillReport({ attempts, onWeak, onMiniTest }: Props) {
  const stats = useMemo(() => skillStats(attempts.map((a) => a.skills)), [attempts])
  const weakest = useMemo(() => weakestSkills(stats), [stats])
  const tests = useMemo(() => attempts.filter((a) => a.mode === 'test' && a.est), [attempts])
  const totalAnswered = attempts.reduce((s, a) => s + a.n, 0)

  if (!attempts.length) {
    return (
      <div className="toeic-empty">
        <p>Chưa có dữ liệu — hãy luyện vài câu hoặc thi thử để hệ thống tìm điểm yếu giúp bạn.</p>
        <button className="btn-primary" onClick={onMiniTest}><Icon name="trophy" size={15} /> Thi thử đo trình độ</button>
      </div>
    )
  }

  const latest = tests.length ? tests[tests.length - 1].est! : null
  const first = tests.length > 1 ? tests[0].est! : null
  const maxTotal = Math.max(...tests.map((t) => t.est!.total), TOEIC_TARGET)

  return (
    <div className="toeic-report">
      {latest && (
        <div className="tr-score-row">
          <div className="tr-score-card">
            <small>Ước lượng gần nhất</small>
            <b className={latest.total >= TOEIC_TARGET ? 'hit' : ''}>{latest.total}</b>
            <span>/ 990 · mục tiêu {TOEIC_TARGET}+</span>
          </div>
          <div className="tr-score-card">
            <small>Listening</small>
            <b>{latest.listening}</b>
            <span>/ 495</span>
          </div>
          <div className="tr-score-card">
            <small>Reading</small>
            <b>{latest.reading}</b>
            <span>/ 495</span>
          </div>
          {first && (
            <div className="tr-score-card">
              <small>So với lần đầu</small>
              <b className={latest.total >= first.total ? 'hit' : ''}>
                {latest.total >= first.total ? '+' : ''}{latest.total - first.total}
              </b>
              <span>điểm</span>
            </div>
          )}
        </div>
      )}

      {tests.length > 0 && (
        <div className="tr-history">
          <div className="tr-sec-title">Tiến bộ qua các lần thi thử</div>
          <div className="tr-bars">
            {tests.map((t, i) => (
              <div key={i} className="tr-bar-col" title={`${t.est!.total} điểm — ${new Date(t.t).toLocaleDateString('vi-VN')}`}>
                <div className="tr-bar-wrap">
                  <div
                    className={'tr-bar' + (t.est!.total >= TOEIC_TARGET ? ' hit' : '')}
                    style={{ height: `${Math.max(6, (t.est!.total / maxTotal) * 100)}%` }}
                  />
                </div>
                <b>{t.est!.total}</b>
                <small>Lần {i + 1}</small>
              </div>
            ))}
            <div className="tr-bar-col target" title={`Mục tiêu ${TOEIC_TARGET}`}>
              <div className="tr-bar-wrap"><div className="tr-bar goal" style={{ height: `${(TOEIC_TARGET / maxTotal) * 100}%` }} /></div>
              <b>{TOEIC_TARGET}</b>
              <small>Mục tiêu</small>
            </div>
          </div>
        </div>
      )}

      {weakest.length > 0 && (
        <div className="tr-weak">
          <div className="tr-sec-title">3 kỹ năng cần vá gấp nhất</div>
          {weakest.map((s) => (
            <div key={s.skill} className="tr-weak-item">
              <div className="tr-weak-head">
                <b>{s.vi}</b>
                <span className="tr-weak-pct">{s.pct}% ({s.correct}/{s.total} câu)</span>
              </div>
              <p>{s.advice}</p>
            </div>
          ))}
          <button className="btn-primary" onClick={() => onWeak(10)}>
            <Icon name="tool" size={15} /> Luyện ngay 10 câu nhắm vào điểm yếu
          </button>
        </div>
      )}

      <div className="tr-all-skills">
        <div className="tr-sec-title">Toàn bộ kỹ năng ({totalAnswered} câu đã làm)</div>
        {(['listening', 'grammar', 'reading'] as const).map((grp) => {
          const rows = stats.filter((s) => s.group === grp)
          if (!rows.length) return null
          return (
            <div key={grp} className="tr-skill-group">
              <small>{GROUP_LABEL[grp]}</small>
              {rows.map((s) => (
                <div key={s.skill} className="tr-skill-row">
                  <span className="tr-skill-name">{s.vi}</span>
                  <div className="tr-skill-bar">
                    <div className={s.pct >= 80 ? 'good' : s.pct < 55 ? 'bad' : ''} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="tr-skill-num">{s.pct}%</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
