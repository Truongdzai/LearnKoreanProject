const UID_KEY = 'vyling.uid'

// Thiết lập theo THIẾT BỊ (không phải dữ liệu tài khoản) — giữ lại khi đổi/đăng xuất.
const KEEP_EXACT = new Set<string>([
  'vyling.theme',
  'vyling.learnLang',
  'vyling.nativeLang',
  'vyling.uiLang',
  'vyling.dailyGoal',
  'vyling.token',
  UID_KEY,
])
const KEEP_PREFIX = ['vyling.pet.']

// Xoá MỌI dữ liệu học gắn với tài khoản trong localStorage (lộ trình, TOEIC, ngữ pháp,
// phát âm, từ đã thuộc, XP hôm nay, mục tiêu…). Giữ nguyên thiết lập thiết bị ở trên.
export function clearUserScopedStorage(): void {
  try {
    const drop: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith('vyling.')) continue
      if (KEEP_EXACT.has(k)) continue
      if (KEEP_PREFIX.some((p) => k.startsWith(p))) continue
      drop.push(k)
    }
    drop.forEach((k) => localStorage.removeItem(k))
  } catch {  }
}

// Đồng bộ chủ sở hữu dữ liệu local với người vừa đăng nhập.
// Nếu localStorage đang giữ dữ liệu của MỘT tài khoản KHÁC → xoá sạch rồi tải lại
// trang để mọi state trong bộ nhớ + bộ đệm module được dựng lại từ server.
// Lần đầu đăng nhập từ trạng thái khách (chưa có uid) thì giữ nguyên để tiến trình
// học lúc chưa đăng nhập được nhập vào tài khoản.
export function syncUserScope(uid: string): void {
  if (!uid) return
  let prev: string | null = null
  try { prev = localStorage.getItem(UID_KEY) } catch {  }
  if (prev && prev !== uid) {
    clearUserScopedStorage()
    try { localStorage.setItem(UID_KEY, uid) } catch {  }
    window.location.reload()
    return
  }
  try { localStorage.setItem(UID_KEY, uid) } catch {  }
}

export function forgetUserScope(): void {
  clearUserScopedStorage()
  try { localStorage.removeItem(UID_KEY) } catch {  }
}
