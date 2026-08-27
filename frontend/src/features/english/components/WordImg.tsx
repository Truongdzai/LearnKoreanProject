import { staticImage, useStaticImages } from '../deep/staticImage'

interface Props {
  term: string
  emoji: string
  className?: string
}

export default function WordImg({ term, emoji, className = 'vl-img' }: Props) {
  useStaticImages()
  const src = staticImage(term)
  return (
    <div className={src ? `${className} has-pic` : className}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span>{emoji}</span>}
    </div>
  )
}
