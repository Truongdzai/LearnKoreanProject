import VectorPet, { VECTOR_ARTS } from './VectorPet'

export type PetMood =
  | 'happy'
  | 'wink'
  | 'love'
  | 'sleepy'
  | 'sleep'
  | 'reading'
  | 'shy'
  | 'confused'
  | 'scared'

const MOODS: PetMood[] = ['happy', 'wink', 'love', 'sleepy', 'sleep', 'reading', 'shy', 'confused', 'scared']

type Frame = { url: string; video: boolean }

// Mọi media pet đặt theo: ./img/<tên-pet>/<biểu-cảm>.(png|webm|mp4) — Vite đóng gói sẵn.
// Thả thêm folder vào đây là pet đó TỰ chuyển sang dùng media thật (thay vector).
const PNG = import.meta.glob('./img/*/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const VID = import.meta.glob('./img/*/*.{webm,mp4}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

// Gom media theo loài: { art: { mood: frame } }. Video được ưu tiên hơn ảnh tĩnh.
const MEDIA: Record<string, Partial<Record<PetMood, Frame>>> = {}
function add(path: string, url: string, video: boolean) {
  const m = path.match(/\.\/img\/([^/]+)\/([^/]+)\.[^.]+$/)
  if (!m) return
  const set = (MEDIA[m[1]] ||= {})
  const mood = m[2] as PetMood
  if (video || !set[mood]?.video) set[mood] = { url, video }
}
for (const [path, url] of Object.entries(PNG)) add(path, url, false)
for (const [path, url] of Object.entries(VID)) add(path, url, true)

/** Các loài đã có media thật (ưu tiên hơn vector). */
export const IMAGE_ARTS = Object.keys(MEDIA)

/** Pet media thật: mọi biểu cảm xếp chồng, chuyển bằng cross-fade + "thở" nhẹ. */
function MediaPet({ art, size, mood, className }: { art: string; size: number; mood: PetMood; className?: string }) {
  const set = MEDIA[art]
  const has = MOODS.filter((m) => set[m])
  const active = set[mood] ? mood : set.happy ? 'happy' : has[0]
  return (
    <span
      className={'pet-art' + (className ? ' ' + className : '')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {has.map((m) => {
        const f = set[m]!
        const on = m === active
        const cls = 'pet-frame' + (f.video ? ' pet-frame-vid' : '') + (on ? ' on' : '')
        // Frame đang hiện tải ngay; frame ẩn để lười tải + video ẩn không preload -> nhẹ lúc đầu.
        return f.video ? (
          <video key={m} src={f.url} className={cls} autoPlay loop muted playsInline preload={on ? 'auto' : 'none'} />
        ) : (
          <img
            key={m} src={f.url} alt="" draggable={false} className={cls} decoding="async"
            loading={on ? 'eager' : 'lazy'}
          />
        )
      })}
    </span>
  )
}

interface PetProps {
  art?: string
  size?: number
  mood?: PetMood
  className?: string
}

/** Điều phối: loài có media -> media thật; còn lại -> vẽ vector. */
export default function Pet({ art = 'shiba', size = 96, mood = 'happy', className }: PetProps) {
  if (MEDIA[art]) return <MediaPet art={art} size={size} mood={mood} className={className} />
  return <VectorPet art={art} size={size} mood={mood} className={className} />
}

/** Mọi loài shop/picker có thể hiển thị (media thật + vector, không trùng). */
export const PET_ARTS = Array.from(new Set(['shiba', ...IMAGE_ARTS, ...VECTOR_ARTS]))
