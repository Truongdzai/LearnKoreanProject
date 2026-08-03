import { useMemo } from 'react'
import { tokenize } from '@/core/segment'
import { useReadings } from '@/core/readings'

interface Props {
  text: string
  show: boolean
  className?: string
}

export default function PinyinText({ text, show, className }: Props) {
  const lines = useMemo(() => text.split('\n'), [text])
  const tokens = useMemo(() => lines.flatMap((l) => tokenize(l, 'zh')), [text])
  const wordList = useMemo(() => tokens.filter((t) => t.word).map((t) => t.text), [tokens])
  const readings = useReadings(show ? wordList : [], 'zh')

  if (!show) {
    return (
      <span lang="zh" className={className}>
        {lines.map((l, k) => <span key={k} className="zh-line">{l}</span>)}
      </span>
    )
  }

  return (
    <span lang="zh" className={(className ? className + ' ' : '') + 'zh-ruby'}>
      {lines.map((line, li) => (
        <span key={li} className="zh-line">
          {tokenize(line, 'zh').map((tk, k) => (
            <span key={k} className="zh-tok">
              <i>{tk.word ? readings[tk.text] ?? '' : ''}</i>
              {tk.text}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}
