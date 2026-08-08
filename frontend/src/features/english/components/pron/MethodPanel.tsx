import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { PRON_LOOP, PRON_RUBRIC, PRON_SESSION, weekPlan } from '@/data/pronMethod'

type Tab = 'loop' | 'session' | 'week' | 'rubric'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'loop', label: 'Vòng luyện', icon: 'refresh' },
  { id: 'session', label: 'Buổi 15 phút', icon: 'clock' },
  { id: 'week', label: 'Kế hoạch 7 ngày', icon: 'calendar' },
  { id: 'rubric', label: 'Thang tự chấm', icon: 'check-circle' },
]

export default function MethodPanel({ lang, onJump }: { lang: string; onJump: (groupId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('loop')
  const days = weekPlan(lang)

  return (
    <div className={'pmt' + (open ? ' open' : '')}>
      <button className="pmt-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Icon name="book" size={16} />
        <span><b>Cách luyện cho hiệu quả</b> — vòng nghe · điều chỉnh · ghi âm, buổi 15 phút và thang tự chấm</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>

      {open && (
        <div className="pmt-body">
          <div className="pron-modes">
            {TABS.map((tb) => (
              <button key={tb.id} className={'pron-mode' + (tab === tb.id ? ' on' : '')} onClick={() => setTab(tb.id)}>
                <Icon name={tb.icon} size={14} /> {tb.label}
              </button>
            ))}
          </div>

          {tab === 'loop' && (
            <>
              <div className="pmt-loop">
                {PRON_LOOP.map((s, i) => (
                  <div key={s.id} className="pmt-step">
                    <span className="pmt-num">{i + 1}</span>
                    <b><Icon name={s.icon} size={15} /> {s.title}</b>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
              <p className="pmt-note">
                Trong một lượt luyện chỉ nên chọn một điểm cần sửa: phẩm chất nguyên âm, âm cuối, độ rung, trọng âm hoặc
                nhịp câu. Khi tai phải theo dõi quá nhiều tiêu chí cùng lúc, bạn sẽ không biết thay đổi nào đã làm bản
                ghi rõ hơn.
              </p>
            </>
          )}

          {tab === 'session' && (
            <>
              <table className="pmt-table">
                <thead>
                  <tr><th>Thời gian</th><th>Hoạt động</th><th>Thao tác cụ thể</th><th>Sản phẩm</th></tr>
                </thead>
                <tbody>
                  {PRON_SESSION.map((b) => (
                    <tr key={b.span}>
                      <td className="pmt-span">{b.span}</td>
                      <td><b>{b.act}</b></td>
                      <td>{b.how}</td>
                      <td className="pmt-out">{b.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pmt-note">
                Nói đuổi đặt ở cuối buổi là có chủ ý: bạn cần xác định xong âm hoặc nhịp mục tiêu rồi mới bắt chước cả
                câu, nếu không sẽ chỉ nói theo mà không sửa được gì.
              </p>
            </>
          )}

          {tab === 'week' && (
            <>
              <table className="pmt-table">
                <thead>
                  <tr><th>Ngày</th><th>Trọng tâm</th><th>Từ hoặc câu mẫu</th><th>Bằng chứng cần lưu</th></tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d.day}>
                      <td className="pmt-span">{d.day}</td>
                      <td>
                        <b>{d.focus}</b>
                        {d.go && (
                          <button className="pmt-jump" onClick={() => onJump(d.go as string)}>
                            Vào luyện <Icon name="arrow-right" size={12} />
                          </button>
                        )}
                      </td>
                      <td>{d.sample}</td>
                      <td className="pmt-out">{d.proof}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pmt-note">
                Ngày thứ bảy là buổi đối chiếu hai bản ghi. Bằng chứng cần tìm phải cụ thể: một cặp nguyên âm đã tách rõ
                hơn, âm cuối xuất hiện ổn định hơn, hoặc câu đã có nhịp nhấn dễ nhận ra hơn.
              </p>
            </>
          )}

          {tab === 'rubric' && (
            <>
              <ul className="pmt-rubric">
                {PRON_RUBRIC.map((r) => (
                  <li key={r.id}>
                    <b>{r.label}</b>
                    <span>{r.q}</span>
                    <em>/1</em>
                  </li>
                ))}
              </ul>
              <p className="pmt-note">
                Chấm bằng tai nghe ở âm lượng vừa phải và chỉ dùng bằng chứng có trong bản ghi. Được 0–2 điểm thì tách
                âm ra và rút ngắn câu; 3–4 điểm thì ghi thêm một bản chỉ sửa tiêu chí còn thiếu; 5 điểm nghĩa là lượt ghi
                ấy đã rõ, chưa phải mọi đặc điểm phát âm đều hoàn hảo. Thang này nằm ngay trong tab “Ghi âm & tự chấm”
                của từng nhóm âm.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
