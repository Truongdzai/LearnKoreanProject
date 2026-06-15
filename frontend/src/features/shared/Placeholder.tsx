import { useAppStore } from '@/store/app.store'
import Icon, { type IconName } from '@/core/components/Icon'
import type { AppView } from '@/core/constants/enum'

const INFO: Record<string, { ic: IconName; h: string; p: string }> = {
  myvideos: { ic: 'tv', h: 'Video của tôi', p: 'Danh sách các video bạn đã học và tiến độ từng video. Sẽ hiện ở đây sau khi mình thêm phần lưu lịch sử học.' },
  courses: { ic: 'book', h: 'Khoá học', p: 'Tự gom các video yêu thích thành lộ trình học riêng và theo dõi tiến độ.' },
  vocab: { ic: 'letters', h: 'Từ vựng', p: 'Tổng hợp những thẻ bạn đã lưu vào Anki để ôn lại nhanh ngay trong web.' },
}

export default function Placeholder({ view }: { view: AppView }) {
  const { setView } = useAppStore()
  const x = INFO[view] ?? { ic: 'tool' as IconName, h: 'Sắp có', p: 'Tính năng này đang được xây dựng.' }
  return (
    <>
      <h1 className="page-title">{x.h}</h1>
      <div className="soon" style={{ marginTop: 14 }}>
        <div className="big"><Icon name={x.ic} /></div>
        <h3>Đang xây dựng</h3>
        <p>{x.p}</p>
        <button className="btn-new" style={{ marginTop: 14 }} onClick={() => setView('home')}>
          <Icon name="arrow-left" /> Về trang chủ
        </button>
      </div>
    </>
  )
}
