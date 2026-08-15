import Icon from '@/core/components/Icon'
import type { ProfileItem, WordProfile } from '@/models/wordprofile.model'

interface Props {
  profile: WordProfile
  extra: { form: string; vi: string; ex: string }[]
  onSay: (text: string) => void
}

function ItemRow({ it, onSay }: { it: ProfileItem; onSay: (t: string) => void }) {
  return (
    <div className="dp-colloc">
      <i className="dp-bullet" />
      <code>{it.form}</code>
      <span>{it.vi}</span>
      <button
        className="ac-play tiny"
        onClick={() => onSay(it.ex || it.form)}
        aria-label={`Nghe: ${it.form}`}
      >
        <Icon name="volume" size={12} />
      </button>
    </div>
  )
}

function Block({
  title, note, items, onSay,
}: {
  title: string
  note?: string
  items: ProfileItem[]
  onSay: (t: string) => void
}) {
  if (!items.length) return null
  return (
    <div className="dp-comboblock">
      <h4>{title} <small>({items.length})</small></h4>
      {note && <p className="dp-combonote">{note}</p>}
      <div className="dp-collocs">
        {items.map((it, i) => <ItemRow key={i} it={it} onSay={onSay} />)}
      </div>
    </div>
  )
}

export default function WordUse({ profile, extra, onSay }: Props) {
  const known = new Set([
    ...profile.combos.flatMap((g) => g.items.map((it) => it.form.toLowerCase())),
    ...profile.phrasals.map((it) => it.form.toLowerCase()),
    ...profile.idioms.map((it) => it.form.toLowerCase()),
  ])
  const mined = extra
    .filter((e) => e.form && !known.has(e.form.toLowerCase()))
    .filter((e) => ![...known].some((k) => k.includes(e.form.toLowerCase())))
  const empty = !profile.combos.length && !profile.phrasals.length && !profile.idioms.length && !mined.length

  if (empty) return null

  return (
    <div className="dp-use">
      {profile.combos.map((g, i) => (
        <Block key={i} title={g.label} note={g.note} items={g.items} onSay={onSay} />
      ))}
      <Block
        title="Cụm động từ (phrasal verbs)"
        note="Đổi giới từ là đổi hẳn nghĩa — nhóm này phải học thuộc từng cụm, không đoán được từ nghĩa gốc."
        items={profile.phrasals}
        onSay={onSay}
      />
      <Block
        title="Thành ngữ & cách nói quen thuộc"
        note="Nghĩa của cả cụm không bằng tổng nghĩa từng từ. Nhớ nguyên cụm thì nói mới tự nhiên."
        items={profile.idioms}
        onSay={onSay}
      />
      <Block
        title="Cụm gặp trong kho bài học"
        note="Những cụm này lấy ra từ chính các câu mẫu và bài học bạn sẽ gặp trong lộ trình."
        items={mined}
        onSay={onSay}
      />
    </div>
  )
}
