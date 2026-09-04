import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { GRAMMAR_LESSONS } from '@/data/englishGrammarData'
import { PRON_GROUPS } from '@/data/englishPronunciationData'
import {
  FAST_PILLARS, MINDSET, PRON_PRIORITY, PRON_SIGNATURE,
  SPOKEN_GRAMMAR_CORE, SPOKEN_GRAMMAR_NOTE, VOCAB_CIRCLES, VOCAB_CIRCLE_NOTE,
  STAGES, SKILLS, LISTEN_SPLIT, FEEDBACK_LOOP,
  type FastLetter,
} from '@/data/englishFast'
import { speakEN } from '@/core/tts'

interface Props {
  onGrammar: (lessonId?: string) => void
  onPron: (groupId?: string) => void
  onSkills: () => void
  onErrors: () => void
}

const LETTERS: FastLetter[] = ['F', 'A', 'S', 'T']

export default function FastMethod({ onGrammar, onPron, onSkills, onErrors }: Props) {
  const [open, setOpen] = useState<FastLetter>('F')
  const pillar = FAST_PILLARS.find((p) => p.letter === open)!

  const coreLessons = GRAMMAR_LESSONS.filter((l) => SPOKEN_GRAMMAR_CORE.includes(l.id))

  return (
    <div className="fast-method">
      <div className="section-title"><span className="pin" /> Học theo phương pháp F.A.S.T</div>

      <div className="fast-intro">
        <Icon name="bulb" size={18} />
        <p>
          Bốn chữ cái trả lời bốn câu hỏi của người học: <b>học gì</b> (Focus), <b>nhớ bằng cách nào</b> (Associate),
          <b> luyện ra sao cho đều</b> (System) và <b>làm sao biết mình sai</b> (Timely feedback).
          Thiếu chữ nào là hỏng chỗ đó — học đúng thứ mà không có phản hồi thì sai vẫn hoàn sai;
          nhớ giỏi mà không có hệ thống thì tuần được tuần mất.
        </p>
      </div>

      <div className="fast-letters">
        {FAST_PILLARS.map((p) => (
          <button
            key={p.letter}
            className={'fast-letter ' + p.tone + (open === p.letter ? ' on' : '')}
            onClick={() => setOpen(p.letter)}
            aria-pressed={open === p.letter}
          >
            <b>{p.letter}</b>
            <span><i>{p.en}</i><small>{p.vi}</small></span>
          </button>
        ))}
      </div>

      <div className={'fast-panel ' + pillar.tone}>
        <div className="fast-panel-head">
          <div className={'fast-panel-ic ' + pillar.tone}><Icon name={pillar.icon} size={20} /></div>
          <div>
            <h3>{pillar.en} <small>· {pillar.vi}</small></h3>
            <p>{pillar.claim}</p>
          </div>
        </div>
        <ul className="fast-points">
          {pillar.points.map((x, i) => (
            <li key={i}><Icon name="check-circle" size={15} /> <span>{x}</span></li>
          ))}
        </ul>

        {open === 'F' && (
          <div className="fast-detail">
            <div className="fast-sub">1 · Phát âm — ba lỗi nặng nhất của người Việt</div>
            <div className="fast-pron">
              {PRON_PRIORITY.map((p) => {
                const groups = PRON_GROUPS.filter((g) => p.groupIds.includes(g.id))
                return (
                  <div key={p.title} className="fast-pron-item">
                    <b>{p.title}</b>
                    <p>{p.why}</p>
                    <div className="fast-chips">
                      {groups.map((g) => (
                        <button key={g.id} className="fast-chip" onClick={() => onPron(g.id)}>
                          {g.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="fast-signature">
              <div>
                <span className="fast-sig-tag">Câu thử vàng</span>
                <b>{PRON_SIGNATURE.en}</b>
                <i>{PRON_SIGNATURE.vi}</i>
                <p>{PRON_SIGNATURE.why}</p>
              </div>
              <button className="btn-primary sm" onClick={() => speakEN(PRON_SIGNATURE.en)}>
                <Icon name="volume" size={15} /> Nghe mẫu
              </button>
            </div>

            <div className="fast-sub">2 · Ngữ pháp nói — chỉ {coreLessons.length} bài là đủ nói</div>
            <p className="fast-note">{SPOKEN_GRAMMAR_NOTE}</p>
            <div className="fast-chips">
              {coreLessons.map((l) => (
                <button key={l.id} className="fast-chip core" onClick={() => onGrammar(l.id)}>
                  <Icon name="check" size={13} /> {l.title}
                </button>
              ))}
            </div>

            <div className="fast-sub">3 · Từ vựng — ba vòng tròn đồng tâm</div>
            <div className="fast-circles">
              {VOCAB_CIRCLES.map((c, i) => (
                <div key={c.id} className={'fast-circle ' + c.tone} style={{ zIndex: 3 - i }}>
                  <b>{c.name}</b>
                  <small>{c.sub}</small>
                  <span>~{c.target.toLocaleString('vi-VN')} từ</span>
                </div>
              ))}
            </div>
            <p className="fast-note">{VOCAB_CIRCLE_NOTE}</p>
          </div>
        )}

        {open === 'A' && (
          <div className="fast-detail">
            <div className="fast-sub">Vùng vừa sức i+1</div>
            <div className="fast-i1">
              <div className="fast-i1-bar">
                <span className="known" style={{ width: '95%' }}>95% đã hiểu</span>
                <span className="new" style={{ width: '5%' }} />
              </div>
              <p>
                Tài liệu tốt là tài liệu bạn hiểu được khoảng <b>95%</b>, chỉ <b>4–5%</b> là từ mới.
                Dễ quá thì không học được gì; khó quá thì não bận giải mã, không còn chỗ để ghi nhớ.
                Bài đọc trong tab <b>4 Kỹ năng → Đọc</b> chia sẵn ba cấp và ghi rõ số từ mới của từng bài,
                để bạn tự lùi xuống khi thấy phải tra quá nhiều.
              </p>
            </div>
            <div className="fast-sub">Nhớ bằng cảm xúc, không bằng ý chí</div>
            <p className="fast-note">
              Thông tin + cảm xúc = trí nhớ dài hạn. Một từ gắn với câu chuyện buồn cười của chính bạn sẽ ở lại
              lâu hơn một từ đọc đi đọc lại hai mươi lần. Đây chính là lý do phương pháp <b>ICES</b> bên dưới
              bắt mỗi từ phải có hình ảnh, mẹo liên tưởng, câu tình huống và âm thanh.
            </p>
          </div>
        )}

        {open === 'S' && (
          <div className="fast-detail">
            <div className="fast-sub">Chia giờ cho 4 kỹ năng theo trình độ</div>
            <div className="fast-budget-preview">
              {STAGES.map((s) => (
                <div key={s.id} className="fast-bp">
                  <div className="fast-bp-head"><b>{s.name}</b> <span>{s.range}</span></div>
                  <div className="fast-bp-bar">
                    {SKILLS.map((sk) => (
                      <span
                        key={sk.id}
                        className={sk.tone}
                        style={{ width: `${s.budget[sk.id]}%` }}
                        title={`${sk.name} ${s.budget[sk.id]}%`}
                      >
                        {s.budget[sk.id] >= 15 ? `${sk.name} ${s.budget[sk.id]}%` : ''}
                      </span>
                    ))}
                  </div>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="fast-sub">Giờ nghe còn được chia nhỏ lần nữa</div>
            <div className="fast-listen-preview">
              {LISTEN_SPLIT.map((l) => (
                <div key={l.id} className="fast-lp">
                  <b>{l.pct}%</b>
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
            <p className="fast-note">
              Nghe không phải là "bật cho có". Năm việc trên đòi hỏi mức tập trung khác nhau, và bỏ sót việc nào
              là thủng đúng chỗ đó. Mở tab <b>4 Kỹ năng</b> để đặt ngân sách phút mỗi tuần và bấm ghi giờ sau mỗi buổi.
            </p>
            <button className="btn-primary sm" onClick={onSkills}>
              <Icon name="chart" size={15} /> Mở bảng ngân sách kỹ năng
            </button>
          </div>
        )}

        {open === 'T' && (
          <div className="fast-detail">
            <div className="fast-sub">Vòng lặp phản hồi 4 nhịp</div>
            <div className="fast-loop">
              {FEEDBACK_LOOP.map((s) => (
                <div key={s.n} className="fast-loop-step">
                  <b>{s.n}</b>
                  <div><h4>{s.title}</h4><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
            <p className="fast-note">
              Lỗi hoá thạch là lỗi đã lặp đủ lâu để thành phản xạ. Lúc đó sửa một lỗi tốn gấp nhiều lần
              so với học đúng ngay từ đầu — đó là lý do chữ T đứng cuối nhưng phải chạy song song với ba chữ kia
              ngay từ ngày đầu tiên.
            </p>
            <button className="btn-primary sm" onClick={onErrors}>
              <Icon name="bell" size={15} /> Mở sổ lỗi của tôi
            </button>
          </div>
        )}
      </div>

      <div className="section-title"><span className="pin" /> Bốn hiểu lầm phải bỏ trước đã</div>
      <div className="fast-mindset">
        {MINDSET.map((m, i) => (
          <div key={i} className="fast-mind">
            <div className="fast-mind-ic"><Icon name={m.icon} size={18} /></div>
            <div>
              <p className="wrong"><Icon name="x-circle" size={14} /> {m.wrong}</p>
              <p className="right"><Icon name="check-circle" size={14} /> {m.right}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fast-order">
        {LETTERS.map((l, i) => (
          <span key={l} className="fast-order-step">
            <b>{l}</b>
            {i < LETTERS.length - 1 && <Icon name="arrow-right" size={14} />}
          </span>
        ))}
        <p>Bốn chữ không chạy nối đuôi mà chạy cùng lúc — mỗi tuần bạn đều phải chạm đủ cả bốn.</p>
      </div>
    </div>
  )
}
