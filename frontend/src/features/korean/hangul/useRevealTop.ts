import { useEffect, useRef } from 'react'

// Đổi màn (mở bài, bắt đầu kiểm tra, xem kết quả) mà đầu khung đã trôi lên khuất
// dưới thanh trên cùng thì cuộn về để người học thấy ngay phần mới.
export function useRevealTop<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (el && el.getBoundingClientRect().top < 64) el.scrollIntoView({ block: 'start' })
  }, [key])
  return ref
}
