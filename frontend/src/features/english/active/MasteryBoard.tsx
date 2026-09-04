import Icon from '@/core/components/Icon'
import {
  DIMS, LEVELS, PACKS, speedBand, SPEED_LABEL, AUTOMATIC_MS,
} from '@/data/englishActive'
import { useMastery } from './mastery'

interface Props {
  onOpenPack?: (packId: string) => void
  onDrillDue?: () => void
}

export default function MasteryBoard({ onOpenPack, onDrillDue }: Props) {
  const { stats, todayLog, streak, packProgress, state } = useMastery()

  const maxLevel = Math.max(1, ...stats.byLevel.slice(1))
  const sec = stats.medianMs ? (stats.medianMs / 1000).toFixed(1) : '—'
  const band = speedBand(stats.medianMs)

  return (
    <div className="ac-board">
      <div className="ac-kpi-note">
        <Icon name="target" size={16} />
        <div>
          <b>Chỉ số ở đây cố tình không phải "bạn đã học bao nhiêu cụm"</b>
          <span>
            Câu hỏi đúng là: bạn <em>làm chủ</em> được bao nhiêu, tự bật ra được bao nhiêu, và mất bao lâu để bật ra.
            500 cụm dùng được đáng giá hơn 3000 cụm nhìn thấy quen quen.
          </span>
        </div>
      </div>

      <div className="ac-kpis">
        <div className="ac-kpi lead">
          <span>DÙNG ĐƯỢC CHỦ ĐỘNG</span>
          <b>{stats.active}</b>
          <small>cụm từ mức 3 trở lên — tự nhớ ra khi cần</small>
        </div>
        <div className="ac-kpi">
          <span>TỰ ĐỘNG</span>
          <b>{stats.automatic}</b>
          <small>bật ra dưới {(AUTOMATIC_MS / 1000).toFixed(0)}s, không cần dịch</small>
        </div>
        <div className="ac-kpi">
          <span>TỐC ĐỘ TRUY XUẤT</span>
          <b className={'sp-' + band}>{sec}<i>s</i></b>
          <small>{SPEED_LABEL[band]} · {stats.fastPct}% số cụm bật ra ngay</small>
        </div>
        <div className="ac-kpi">
          <span>ĐÃ CHẠM TỚI</span>
          <b>{stats.touched}<i>/{stats.total}</i></b>
          <small>chạm tới không phải làm chủ — xem cột dưới</small>
        </div>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="chart" size={17} /> Tháp làm chủ</h3>
          <span>Một cụm chỉ lên tầng trên khi vượt được bài kiểm ở tầng đó</span>
        </div>
        <div className="ac-pyramid">
          {[...LEVELS].reverse().map((l) => {
            const n = stats.byLevel[l.lv]
            const dim = DIMS.find((d) => d.proves === l.lv)
            return (
              <div key={l.lv} className={'ac-tier' + (n ? ' has' : '')}>
                <span className="ac-tier-lv">{l.lv}</span>
                <div className="ac-tier-body">
                  <b>{l.name} <em>{l.en}</em></b>
                  <small>{l.desc}</small>
                  {dim && <span className="ac-tier-gate">Cửa ải: {dim.question}</span>}
                </div>
                <div className="ac-tier-bar">
                  <div className={l.tone} style={{ width: `${l.lv === 0 ? 0 : (n / maxLevel) * 100}%` }} />
                </div>
                <b className="ac-tier-n">{n}</b>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ac-two">
        <div className="ac-panel">
          <div className="ac-panel-head">
            <h3><Icon name="calendar" size={17} /> Hôm nay</h3>
            <span>Chuỗi {streak} ngày</span>
          </div>
          <div className="ac-today">
            <div><b>{todayLog.drills}</b><span>lượt truy xuất</span></div>
            <div><b>{todayLog.outputs}</b><span>lần tự nói / tự viết</span></div>
            <div><b>{todayLog.scenes}</b><span>lượt xem cảnh</span></div>
          </div>
          <div className="ac-due">
            <div>
              <b>{stats.due} cụm tới hạn ôn</b>
              <small>Ôn đúng lúc sắp quên, và lần này kiểm ở chiều khó hơn lần trước.</small>
            </div>
            {onDrillDue && stats.due > 0 && (
              <button className="ac-next" onClick={onDrillDue}>Ôn ngay <Icon name="arrow-right" size={15} /></button>
            )}
          </div>
        </div>

        <div className="ac-panel">
          <div className="ac-panel-head">
            <h3><Icon name="bulb" size={17} /> Năm chiều kiểm tra</h3>
            <span>Cảm giác "nhớ rồi" không đáng tin — phải soi từ nhiều phía</span>
          </div>
          <ul className="ac-dimlist">
            {DIMS.map((d) => (
              <li key={d.id}>
                <span className={'ac-dim ' + d.tone}><Icon name={d.icon} size={13} /> {d.name}</span>
                <small>{d.desc}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="map" size={17} /> Theo gói tình huống</h3>
          <span>
            {state.goal
              ? `Mục tiêu của bạn: ${PACKS.find((p) => p.id === state.goal)?.name}`
              : 'Bạn chưa chọn mục tiêu — bấm một gói bên dưới để đặt'}
          </span>
        </div>
        <div className="ac-packprog">
          {PACKS.map((p) => {
            const pr = packProgress(p)
            return (
              <button key={p.id} className="ac-packrow" onClick={() => onOpenPack?.(p.id)}>
                <span className={'ac-packemoji ' + p.tone}>{p.cefr}</span>
                <div className="ac-packrow-body">
                  <b>{p.name}{state.goal === p.id && <em> · mục tiêu</em>}</b>
                  <small>{pr.active}/{pr.total} cụm dùng được chủ động · xem cảnh {pr.watched} lượt</small>
                  <div className="ac-packbar"><div style={{ width: `${pr.pct}%` }} /></div>
                </div>
                <b className="ac-packpct">{pr.pct}%</b>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
