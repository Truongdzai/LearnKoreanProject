import type { ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import type { ProfileSense, WordProfile } from '@/models/wordprofile.model'
import { POS_VI, senseGroups } from './profiles'
import type { WordProgress } from './deep'

interface Props {
  profile: WordProfile
  prog: WordProgress
  figure?: ReactNode
  onToggle: (index: number) => void
  onSay: (text: string, rate?: number) => void
}

function Freq({ n }: { n: number }) {
  return (
    <span className="dp-freq" title={`Mức phổ biến ${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={i < n ? 'on' : ''} />
      ))}
    </span>
  )
}

function Example({ en, vi, onSay }: { en: string; vi: string; onSay: (t: string) => void }) {
  if (!en) return null
  return (
    <div className="dp-sensex">
      <button className="ac-play tiny" onClick={() => onSay(en)} aria-label={`Nghe câu: ${en}`}>
        <Icon name="volume" size={12} />
      </button>
      <div>
        <em>{en}</em>
        {vi && <small>{vi}</small>}
      </div>
    </div>
  )
}

function SenseCard({
  sense, n, on, onToggle, onSay,
}: {
  sense: ProfileSense
  n: number
  on: boolean
  onToggle: () => void
  onSay: (text: string) => void
}) {
  return (
    <article className={'dp-sense' + (on ? ' on' : '')}>
      <div className="dp-sensetop">
        <span className="dp-sensen">{n}</span>
        <div className="dp-sensehead">
          <b>{sense.vi}</b>
          {sense.en && <span className="dp-sensedef">{sense.en}</span>}
        </div>
        <Freq n={sense.freq} />
      </div>
      {sense.reg && <span className="dp-reg">{sense.reg}</span>}
      <Example en={sense.ex} vi={sense.exVi} onSay={onSay} />
      <Example en={sense.ex2} vi={sense.ex2Vi} onSay={onSay} />
      <button className={'dp-got' + (on ? ' on' : '')} onClick={onToggle}>
        <Icon name={on ? 'check-circle' : 'plus'} size={14} />
        {on ? 'Đã hiểu nghĩa này' : 'Đánh dấu đã hiểu'}
      </button>
    </article>
  )
}

export default function SenseMap({ profile, prog, figure, onToggle, onSay }: Props) {
  const groups = senseGroups(profile)
  const total = profile.senses.length
  const got = prog.senses.filter((i) => i < total).length
  const order = new Map(groups.flatMap((g) => g.senses).map((s, n) => [s.i, n + 1]))

  return (
    <div className="dp-sensemap">
      <div className="dp-senseline">
        <div className="dp-sensebar">
          <i style={{ width: `${total ? (got / total) * 100 : 0}%` }} />
        </div>
        <b>{got}/{total} nghĩa đã nắm</b>
      </div>

      {(profile.core || figure) && (
        <div className="dp-sensehero">
          {profile.core && (
            <div className="dp-corebox">
              <b><Icon name="bulb" size={14} /> Ý lõi của từ</b>
              <p>{profile.core.replace(/^Ý lõi:\s*/i, '')}</p>
              <small>Mọi nghĩa bên dưới đều mọc ra từ ý này — nhớ gốc thì không phải học thuộc từng nghĩa rời rạc.</small>
            </div>
          )}
          {figure}
        </div>
      )}

      {groups.map((g) => (
        <section key={g.pos} className="dp-sensegroup">
          <h4><span className={'dp-posdot ' + g.pos} /> {POS_VI[g.pos]} <small>({g.senses.length} nghĩa)</small></h4>
          <div className="dp-senselist2">
            {g.senses.map(({ sense, i }) => (
              <SenseCard
                key={i}
                sense={sense}
                n={order.get(i) ?? i + 1}
                on={prog.senses.includes(i)}
                onToggle={() => onToggle(i)}
                onSay={onSay}
              />
            ))}
          </div>
        </section>
      ))}

      {profile.grammar && (
        <div className="dp-gram">
          <b><Icon name="book" size={14} /> Ngữ pháp đi kèm</b>
          <p>{profile.grammar}</p>
        </div>
      )}
    </div>
  )
}
