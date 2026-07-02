/**
 * Từ điển giao diện đa ngôn ngữ (i18n) — đợt 1: vỏ ứng dụng
 * (Sidebar, Topbar, Trang chủ, Mục tiêu ngày, Từ của ngày, Onboarding, Góp ý).
 * `vi` là ngôn ngữ gốc; key thiếu ở ngôn ngữ khác sẽ tự rơi về tiếng Việt.
 * Chuỗi có tham số dùng dạng {name} — thay bằng t(key, { name: value }).
 */

export type UiLang = 'vi' | 'en'

export const UI_LANGS: { code: UiLang; label: string }[] = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
]

const VI: Record<string, string> = {
  // Sidebar
  'brand.tagline': 'Học ngoại ngữ qua video',
  'side.streak': 'Chuỗi {n} ngày',
  'side.langs': 'Ngôn ngữ',
  'side.upgrade': 'Nâng cấp Plus',
  'nav.home': 'Trang chủ',
  'nav.library': 'Kho video',
  'nav.myvideos': 'Video của tôi',
  'nav.path': 'Lộ trình',
  'nav.speaking': 'Luyện nói',
  'nav.english': 'Tiếng Anh 3 tháng',
  'nav.lingo': 'Hot Lingo',
  'nav.vocab': 'Từ vựng',
  'nav.flashcards': 'Ôn tập',
  'nav.activities': 'Hoạt động',
  'nav.leaderboard': 'Bảng xếp hạng',
  'nav.quests': 'Nhiệm vụ',
  'nav.shop': 'Cửa hàng',
  'nav.garden': 'Vườn của tôi',

  // Topbar
  'top.lookup': 'Tra cứu từ vựng với AI',
  'top.search': 'Tra cứu từ vựng {lang}…',
  'top.coins': 'Xu của bạn',
  'top.myvideos': 'Video của tôi',
  'top.light': 'Chế độ sáng',
  'top.dark': 'Chế độ tối',
  'top.login': 'Đăng nhập',
  'top.menu.activities': 'Hoạt động của tôi',
  'top.menu.upgrade': 'Nâng cấp Plus',
  'top.menu.admin': 'Trang quản trị',
  'top.menu.logout': 'Đăng xuất',
  'top.uiLang': 'Ngôn ngữ giao diện',

  // Hero (trang chủ)
  'hero.title': 'Luyện Shadowing qua bất kỳ video nào bạn thích',
  'hero.sub': 'Dán link YouTube {lang} có ngay phụ đề song ngữ, học theo từng câu và lưu vào flashcard.',
  'hero.upload': 'Tải lên (sắp có)',
  'hero.soon': 'Sắp có',
  'hero.placeholder': 'Dán link YouTube {lang} vào đây…',
  'hero.create': 'Tạo bài học',
  'hero.tip': 'Mẹo: chọn video có phụ đề {lang} để chất lượng tốt nhất. Lần đầu tải mất ~10-60 giây.',
  'hero.sample': 'Thử ngay bài học mẫu (không cần dán link)',

  // Trang chủ
  'home.goalChip.set': '🎯 Mục tiêu:',
  'home.goalChip.none': '🎯 Chọn mục tiêu học',
  'home.goalChip.hint': 'Đổi mục tiêu học',
  'home.cat.all': 'Toàn bộ',
  'home.cat.beginner': 'Mới bắt đầu',
  'home.cat.podcast': 'Podcast',
  'home.cat.conversation': 'Hội thoại',
  'home.cat.story': 'Truyện ngắn',
  'home.cat.vlog': 'Vlog',
  'home.cat.culture': 'Văn hoá',
  'home.cat.other': 'Khác',
  'home.pathTitle': 'Bắt đầu lộ trình của bạn',
  'home.cta.title': 'Tạo lộ trình học cá nhân hoá',
  'home.cta.li1': 'Lộ trình theo trình độ & mục tiêu của bạn',
  'home.cta.li2': 'Theo dõi tiến độ từng video',
  'home.cta.li3': 'Tự gom video yêu thích thành khoá học riêng',
  'home.cta.btn': 'Tạo lộ trình',
  'home.libTitle': 'Kho video {lang}',
  'home.viewAll': 'Xem tất cả',
  'home.empty': 'Kho video {lang} đang được cập nhật. Bạn có thể dán link YouTube {lang} ở trên để tạo bài học ngay.',

  // Mục tiêu hôm nay
  'dgoal.title': 'Mục tiêu hôm nay',
  'dgoal.levelHint': '{label} — {xp} XP/ngày · thưởng {coins} xu',
  'dgoal.lv30': 'Nhẹ nhàng',
  'dgoal.lv50': 'Vừa sức',
  'dgoal.lv100': 'Chăm chỉ',
  'dgoal.lv200': 'Cày cuốc',
  'dgoal.rewarded': '🎉 +{n} xu vào túi! Hẹn rương mới vào ngày mai',
  'dgoal.streakOn': ' — chuỗi {n} ngày vẫn cháy 🔥',
  'dgoal.reached': '🎉 Đã đạt {a}/{b} XP hôm nay',
  'dgoal.zeroStreak': '🔥 Chuỗi {n} ngày đang chờ — học vài phút để giữ lửa nhé!',
  'dgoal.zero': 'Hôm nay bạn chưa học — chỉ 1 video ngắn là đủ khởi động!',
  'dgoal.progress': '{a}/{b} XP — cố thêm chút nữa là chạm mục tiêu!',
  'dgoal.chest': 'Mở rương +{n} xu',
  'dgoal.chestOpening': 'Đang mở…',
  'dgoal.chestLogin': 'Đăng nhập nhận thưởng xu',
  'dgoal.claimed': '✅ Đã nhận thưởng hôm nay',
  'dgoal.watch': 'Học video',
  'dgoal.review': 'Ôn tập',
  'dgoal.level': 'Cấp {n}',
  'dgoal.levelNext': 'còn {xp} XP lên cấp {n}',

  // Từ của ngày
  'wod.title': 'Từ của ngày',
  'wod.listen': 'Nghe phát âm',
  'wod.deep': 'Tra sâu hơn với AI',

  // Onboarding mục tiêu
  'ob.title': 'Bạn học {lang} để làm gì?',
  'ob.sub': 'Chọn mục tiêu để VyLing gợi ý đúng nội dung bạn cần — "dùng gì học nấy".',
  'ob.skip': 'Để sau, tôi muốn khám phá trước',
  'goal.talk.label': 'Giao tiếp',
  'goal.talk.desc': 'Trò chuyện tự nhiên trong đời sống hằng ngày',
  'goal.work.label': 'Công việc',
  'goal.work.desc': 'Làm việc, họp hành, email với đồng nghiệp & khách hàng',
  'goal.travel.label': 'Du lịch',
  'goal.travel.desc': 'Tự tin đặt phòng, hỏi đường, gọi món khi đi chơi',
  'goal.exam.label': 'Luyện thi',
  'goal.exam.desc': 'Chinh phục TOPIK, TOEIC, JLPT… điểm cao',

  // Góp ý
  'fb.fab': 'Góp ý',
  'fb.fabHint': 'Báo lỗi hoặc góp ý cho VyLing',
  'fb.title': 'Góp ý cho VyLing',
  'fb.sub': 'Gặp lỗi hay có ý tưởng hay? Kể cho tụi mình nghe nhé.',
  'fb.bug': '🐞 Báo lỗi',
  'fb.idea': '💡 Góp ý / ý tưởng',
  'fb.phBug': 'Bạn gặp lỗi gì, ở trang nào, bấm gì thì bị? Càng chi tiết càng dễ sửa…',
  'fb.phIdea': 'Bạn muốn VyLing có thêm gì, hay điều gì nên làm khác đi?',
  'fb.send': 'Gửi phản hồi',
  'fb.sending': 'Đang gửi…',
  'fb.thanks': 'Cảm ơn bạn!',
  'fb.thanksSub': 'Phản hồi của bạn đã được gửi — mỗi góp ý đều giúp VyLing tốt hơn.',
  'fb.close': 'Đóng',
}

const EN: Record<string, string> = {
  // Sidebar
  'brand.tagline': 'Learn languages through video',
  'side.streak': '{n}-day streak',
  'side.langs': 'Languages',
  'side.upgrade': 'Upgrade to Plus',
  'nav.home': 'Home',
  'nav.library': 'Video library',
  'nav.myvideos': 'My videos',
  'nav.path': 'Learning path',
  'nav.speaking': 'Speaking',
  'nav.english': 'English in 3 months',
  'nav.lingo': 'Hot Lingo',
  'nav.vocab': 'Vocabulary',
  'nav.flashcards': 'Review',
  'nav.activities': 'Activity',
  'nav.leaderboard': 'Leaderboard',
  'nav.quests': 'Quests',
  'nav.shop': 'Shop',
  'nav.garden': 'My garden',

  // Topbar
  'top.lookup': 'Look up words with AI',
  'top.search': 'Look up {lang} words…',
  'top.coins': 'Your coins',
  'top.myvideos': 'My videos',
  'top.light': 'Light mode',
  'top.dark': 'Dark mode',
  'top.login': 'Sign in',
  'top.menu.activities': 'My activity',
  'top.menu.upgrade': 'Upgrade to Plus',
  'top.menu.admin': 'Admin panel',
  'top.menu.logout': 'Sign out',
  'top.uiLang': 'Interface language',

  // Hero
  'hero.title': 'Shadow any video you love',
  'hero.sub': 'Paste a {lang} YouTube link to get bilingual subtitles instantly — learn line by line and save flashcards.',
  'hero.upload': 'Upload (coming soon)',
  'hero.soon': 'Coming soon',
  'hero.placeholder': 'Paste a {lang} YouTube link here…',
  'hero.create': 'Create lesson',
  'hero.tip': 'Tip: pick videos with {lang} subtitles for best quality. First load takes ~10-60 seconds.',
  'hero.sample': 'Try a sample lesson (no link needed)',

  // Home
  'home.goalChip.set': '🎯 Goal:',
  'home.goalChip.none': '🎯 Pick a learning goal',
  'home.goalChip.hint': 'Change learning goal',
  'home.cat.all': 'All',
  'home.cat.beginner': 'Beginner',
  'home.cat.podcast': 'Podcast',
  'home.cat.conversation': 'Conversation',
  'home.cat.story': 'Short stories',
  'home.cat.vlog': 'Vlog',
  'home.cat.culture': 'Culture',
  'home.cat.other': 'Other',
  'home.pathTitle': 'Start your learning path',
  'home.cta.title': 'Create a personalized path',
  'home.cta.li1': 'A path matching your level & goal',
  'home.cta.li2': 'Track progress video by video',
  'home.cta.li3': 'Turn favorite videos into your own course',
  'home.cta.btn': 'Create path',
  'home.libTitle': '{lang} video library',
  'home.viewAll': 'View all',
  'home.empty': 'The {lang} library is being updated. Paste a {lang} YouTube link above to create a lesson right away.',

  // Daily goal
  'dgoal.title': "Today's goal",
  'dgoal.levelHint': '{label} — {xp} XP/day · {coins} coin reward',
  'dgoal.lv30': 'Casual',
  'dgoal.lv50': 'Regular',
  'dgoal.lv100': 'Serious',
  'dgoal.lv200': 'Intense',
  'dgoal.rewarded': '🎉 +{n} coins earned! A new chest awaits tomorrow',
  'dgoal.streakOn': ' — your {n}-day streak is on fire 🔥',
  'dgoal.reached': "🎉 You've hit {a}/{b} XP today",
  'dgoal.zeroStreak': '🔥 Your {n}-day streak is waiting — a few minutes keeps it alive!',
  'dgoal.zero': "You haven't studied today — one short video gets you going!",
  'dgoal.progress': '{a}/{b} XP — just a little more to reach your goal!',
  'dgoal.chest': 'Open chest +{n} coins',
  'dgoal.chestOpening': 'Opening…',
  'dgoal.chestLogin': 'Sign in to claim coins',
  'dgoal.claimed': '✅ Reward claimed today',
  'dgoal.watch': 'Watch videos',
  'dgoal.review': 'Review',
  'dgoal.level': 'Level {n}',
  'dgoal.levelNext': '{xp} XP to level {n}',

  // Word of the day
  'wod.title': 'Word of the day',
  'wod.listen': 'Listen',
  'wod.deep': 'Explore with AI',

  // Onboarding
  'ob.title': 'Why are you learning {lang}?',
  'ob.sub': "Pick a goal so VyLing suggests exactly what you need — learn what you'll use.",
  'ob.skip': "Later, I'd like to explore first",
  'goal.talk.label': 'Conversation',
  'goal.talk.desc': 'Chat naturally in everyday life',
  'goal.work.label': 'Work',
  'goal.work.desc': 'Meetings, email and work talk with colleagues & clients',
  'goal.travel.label': 'Travel',
  'goal.travel.desc': 'Book rooms, ask directions, order food with confidence',
  'goal.exam.label': 'Exam prep',
  'goal.exam.desc': 'Ace TOPIK, TOEIC, JLPT… with high scores',

  // Feedback
  'fb.fab': 'Feedback',
  'fb.fabHint': 'Report a bug or share an idea',
  'fb.title': 'Feedback for VyLing',
  'fb.sub': 'Found a bug or have a bright idea? Tell us about it.',
  'fb.bug': '🐞 Report a bug',
  'fb.idea': '💡 Suggestion / idea',
  'fb.phBug': 'What went wrong, on which page, after what action? Details help us fix it fast…',
  'fb.phIdea': 'What should VyLing add or do differently?',
  'fb.send': 'Send feedback',
  'fb.sending': 'Sending…',
  'fb.thanks': 'Thank you!',
  'fb.thanksSub': 'Your feedback has been sent — every note makes VyLing better.',
  'fb.close': 'Close',
}

export const MESSAGES: Record<UiLang, Record<string, string>> = { vi: VI, en: EN }

/** Tên hiển thị của ngôn ngữ HỌC theo ngôn ngữ giao diện (dùng trong {lang}). */
const STUDY_NAMES: Record<UiLang, Record<string, string>> = {
  vi: { ko: 'Tiếng Hàn', en: 'Tiếng Anh', ja: 'Tiếng Nhật', zh: 'Tiếng Trung', de: 'Tiếng Đức', vi: 'Tiếng Việt' },
  en: { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Chinese', de: 'German', vi: 'Vietnamese' },
}

export function studyLangName(uiLang: UiLang, code: string): string {
  return STUDY_NAMES[uiLang][code] || STUDY_NAMES.vi[code] || code
}

export function translate(uiLang: UiLang, key: string, params?: Record<string, string | number>): string {
  let s = MESSAGES[uiLang][key] ?? MESSAGES.vi[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v))
  }
  return s
}
