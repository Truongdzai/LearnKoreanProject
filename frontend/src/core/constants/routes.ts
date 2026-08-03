import type { AppView } from './enum'

export const ROUTES: Record<AppView, string> = {
  home: '/',
  learn: '/hoc',
  library: '/kho-video',
  myvideos: '/video-cua-toi',
  courses: '/khoa-hoc',
  path: '/lo-trinh',
  speaking: '/luyen-noi',
  tutor: '/gia-su-ai',
  english: '/tieng-anh-3-thang',
  toeic: '/luyen-thi-toeic',
  korean: '/tieng-han-3-thang',
  chinese: '/tieng-trung-3-thang',
  topik: '/luyen-thi-topik',
  hsk: '/luyen-thi-hsk',
  vocab: '/tu-vung',
  flashcards: '/on-tap',
  activities: '/hoat-dong',
  leaderboard: '/bang-xep-hang',
  quests: '/nhiem-vu',
  shop: '/cua-hang',
  garden: '/vuon-cua-toi',
  lingo: '/hot-lingo',
  dashboard: '/tong-quan',
  pricing: '/bang-gia',
  help: '/tro-giup',
  about: '/ve-chung-toi',
  contact: '/lien-he',
  blog: '/blog',
  terms: '/dieu-khoan',
  privacy: '/bao-mat',
  notfound: '/khong-tim-thay',
  admin: '/quan-tri',
}

const VIEW_BY_PATH: Record<string, AppView> = Object.entries(ROUTES).reduce(
  (acc, [view, path]) => {
    acc[path] = view as AppView
    return acc
  },
  {} as Record<string, AppView>,
)

const TITLE_KEY: Partial<Record<AppView, string>> = {
  help: 'nav.help',
  about: 'nav.about',
  contact: 'nav.contact',
  blog: 'nav.blog',
  terms: 'nav.terms',
  privacy: 'nav.privacy',
  notfound: 'nav.notfound',
  learn: 'page.learn',
  courses: 'nav.path',
  dashboard: 'page.dashboard',
  pricing: 'page.pricing',
  admin: 'page.admin',
}

function normalize(pathname: string): string {
  const p = decodeURIComponent(pathname || '/').toLowerCase().replace(/\/+$/, '')
  return p || '/'
}

export function pathForView(view: AppView): string {
  return ROUTES[view] || '/'
}

export function viewForPath(pathname: string): AppView | null {
  return VIEW_BY_PATH[normalize(pathname)] || null
}

export function titleKeyForView(view: AppView): string {
  return TITLE_KEY[view] || `nav.${view}`
}

export const PUBLIC_VIEWS: AppView[] = [
  'home', 'library', 'english', 'toeic', 'korean', 'topik', 'chinese', 'hsk', 'speaking', 'tutor', 'vocab', 'pricing',
  'help', 'about', 'contact', 'blog', 'terms', 'privacy',
]

export const META_DESC: Partial<Record<AppView, string>> = {
  home: 'Học tiếng Hàn, tiếng Anh qua chính video YouTube bạn thích: phụ đề song ngữ, bấm từ là tra nghĩa, lưu thẻ ôn tập SRS. Miễn phí.',
  library: 'Kho video học ngoại ngữ đã kiểm chứng phụ đề: tiếng Hàn, tiếng Anh, Nhật, Trung, Đức, Việt — lọc theo trình độ và độ dài.',
  english: 'Lộ trình tiếng Anh 90 ngày theo quy tắc 3C: 3000 từ tần suất cao, 18 bài ngữ pháp giao tiếp, 12 nhóm phát âm, tự tick theo tiến độ thật.',
  toeic: 'Luyện thi TOEIC: lộ trình 60 ngày, ngân hàng 504 câu đủ 7 Part, thi thử full test có đồng hồ và sổ tay câu sai.',
  korean: 'Lộ trình tiếng Hàn 90 ngày từ số 0: 805 từ lõi theo phương pháp ICES, 36 mẫu câu, 12 nhóm phát âm người Việt hay sai.',
  chinese: 'Học tiếng Trung từ số 0 cho người Việt: từ vựng lõi theo phương pháp ICES, mẹo nhớ bám âm Hán–Việt, phiên âm pinyin và lộ trình theo khung HSK.',
  hsk: 'Luyện thi HSK 1–2: 18 viên ngữ pháp theo cấp, ngân hàng câu nghe và đọc theo dạng đề thật, bật/tắt pinyin từng câu, thi thử quy đổi thang 200.',
  topik: 'Luyện thi TOPIK: 20 viên ngữ pháp theo cấp, ngân hàng câu nghe và đọc theo dạng đề thật, thi thử quy đổi thang 200 và chấm bài viết bằng AI.',
  speaking: 'Luyện nói với AI qua 20 tình huống đời thật: phỏng vấn, nhà hàng, khách sạn, khám bệnh, họp hành — có gợi ý câu và nhận xét ngay.',
  tutor: 'Gia sư AI 24/7 hiểu đúng trình độ của bạn: giải thích ngữ pháp, sửa câu, gợi ý học gì hôm nay và lưu thẳng từ mới vào thẻ ôn tập.',
  vocab: 'Kho từ vựng cá nhân và ôn tập ngắt quãng (SRS): học tới đâu lưu thẻ tới đó, hệ thống nhắc ôn đúng lúc sắp quên.',
  help: 'Trợ giúp VyLing: hướng dẫn bắt đầu, xử lý lỗi phụ đề, cách hoạt động của thẻ ôn tập và câu hỏi thường gặp về tài khoản.',
  about: 'VyLing là công cụ học ngoại ngữ qua video do người Việt làm cho người Việt tự học: dùng gì học nấy, phần học chính miễn phí, nói thật về tiến độ.',
  contact: 'Liên hệ VyLing: gửi góp ý ngay trong web, email hợp tác nội dung và cách báo cáo bản quyền video.',
  blog: 'Blog VyLing: kinh nghiệm tự học tiếng Hàn, tiếng Anh, phương pháp ôn tập ngắt quãng và hướng dẫn luyện thi TOPIK, TOEIC.',
  terms: 'Điều khoản sử dụng VyLing: quyền và nghĩa vụ khi dùng, bản quyền video YouTube, giới hạn của nội dung do AI tạo ra.',
  privacy: 'Chính sách quyền riêng tư VyLing: lưu những gì, gửi cho ai, giữ bao lâu, và cách bạn tự tải về hoặc xoá sạch dữ liệu của mình.',
  notfound: 'Không tìm thấy trang bạn yêu cầu trên VyLing.',
  pricing: 'Bảng giá VyLing: toàn bộ tính năng học chính miễn phí, gói Plus thêm tiện ích. Không ràng buộc, huỷ bất cứ lúc nào.',
}
