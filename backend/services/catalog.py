from __future__ import annotations

from fastapi import HTTPException

from .. import db

# Kho video theo ngôn ngữ — mọi video đều đã kiểm chứng qua pipeline (có phụ đề
# đúng ngôn ngữ và tải được). (Video VOA bị YouTube chặn tải nên không dùng.)
DEFAULT_KO_VIDEOS = [
    ("GnwIG51ah7k", "Podcast cho người mới #01 — 취미 (Sở thích)", "최수수 ChoiSusu", "TOPIK 1", "3:58", "취미", "tone-a", "ko"),
    ("U_ZzQIV5KgM", "Podcast cho người mới #02 — 날씨와 계절 (Thời tiết & mùa)", "최수수 ChoiSusu", "TOPIK 1", "7:13", "날씨", "tone-b", "ko"),
    ("b11o5ykzKZQ", "Podcast cho người mới #07 — 여행 (Du lịch)", "최수수 ChoiSusu", "TOPIK 1", "15:41", "여행", "tone-c", "ko"),
    ("aZi2d3k0BEE", "Podcast cho người mới #11 — 주말 (Cuối tuần)", "최수수 ChoiSusu", "TOPIK 1", "12:48", "주말", "tone-d", "ko"),
    ("sO14dpV2hv4", "Podcast cho người mới #16 — 일본 여행 후 (Sau chuyến đi Nhật)", "최수수 ChoiSusu", "TOPIK 1", "12:23", "여행 후", "tone-e", "ko"),
    ("8rvv4RXQYb4", "Nghe chậm — 자기소개 (Giới thiệu bản thân)", "Korean with Mina", "TOPIK 1", "7:31", "자기소개", "tone-f", "ko"),
    ("kHsEZUcyD7c", "Nghe chậm lặp lại — luyện phản xạ", "Korean with Mina", "TOPIK 1", "5:22", "반복 듣기", "tone-a", "ko"),
    ("o6AP3nVNj_8", "Truyện ngắn A0 — 윤지는 학교에 가요", "몰입한국어 Immersion", "Vỡ lòng", "10:01", "짧은 이야기", "tone-b", "ko"),
    ("tpnmeXH9VZ4", "Truyện ngắn A1 — 우리 가족 (Gia đình tôi)", "몰입한국어 Immersion", "Vỡ lòng", "5:50", "우리 가족", "tone-c", "ko"),
    ("xHCZVokgaKU", "100 câu hội thoại sơ cấp (TOPIK 1)", "Everyday Korean 매일 한국어", "TOPIK 1", "19:32", "100문장", "tone-d", "ko"),
    ("uRvvbTD5cIw", "Hội thoại sơ cấp 1.1 — nghe & hiểu", "KTS KOREA", "TOPIK 1", "14:03", "초급 대화", "tone-e", "ko"),
    ("abuhSDWTuHE", "Hội thoại đời sống — hỏi đường, mua sắm, tàu điện", "Everyday Korean 매일 한국어", "TOPIK 1-2", "23:49", "일상 회화", "tone-f", "ko"),
    ("9lOJxJBRj1I", "Nghe hiểu dễ — Ở tiệm kem 🍦", "Daily Korean with Jaerim", "TOPIK 1", "5:34", "아이스크림", "tone-a", "ko"),
    ("IGEj-oDKyw8", "Nghe hiểu dễ — Ở cửa hàng tiện lợi", "Daily Korean with Jaerim", "TOPIK 1", "9:40", "편의점", "tone-b", "ko"),
    ("paToZla2CK8", "Nghe hiểu dễ — Đi siêu thị", "Daily Korean with Jaerim", "TOPIK 1", "7:16", "슈퍼마켓", "tone-c", "ko"),
    ("vc3hGLgyXL4", "Nghe hiểu dễ — Ở sân bay ✈️", "Daily Korean with Jaerim", "TOPIK 1", "10:20", "공항", "tone-d", "ko"),
    ("-11--LSPNB0", "10 hội thoại thật ở nhà hàng & quán cà phê", "Small Talk in Korean", "TOPIK 1", "17:17", "식당·카페", "tone-e", "ko"),
    ("GGFJvv7fyqY", "Phỏng vấn đường phố — Người Hàn nghĩ gì về người học tiếng Hàn?", "On the spot Korea", "TOPIK 2", "8:35", "인터뷰", "tone-f", "ko"),
]

DEFAULT_EN_VIDEOS = [
    ("_PIlvBI9rXY", "6 Minute English — How reading shapes your brain", "BBC Learning English", "B1", "6:13", "Đọc sách", "tone-a", "en"),
    ("QdE63sYqwd8", "6 Minute English — Why are we all so stressed?", "BBC Learning English", "B1", "6:14", "Căng thẳng", "tone-b", "en"),
    ("-idY8F7LOSE", "6 Minute English — Stress-free family meals", "BBC Learning English", "B1", "6:16", "Gia đình", "tone-c", "en"),
    ("vOuhs1mA0xo", "6 Minute English — How advertisers make us spend money", "BBC Learning English", "B2", "6:14", "Quảng cáo", "tone-d", "en"),
    ("_LlyKiROzhU", "6 Minute English — Human Emotions (mega class)", "BBC Learning English", "B2", "1:00:59", "Cảm xúc", "tone-e", "en"),
    ("b-PzAyZae-g", "Real English Conversation — luyện hội thoại nâng cao", "Learn English With TV Series", "Nâng cao", "28:39", "Hội thoại thực tế", "tone-f", "en"),
    ("26PrgjTboVQ", "6 Minute English — Are you following your dreams?", "BBC Learning English", "B1", "6:19", "Ước mơ", "tone-a", "en"),
    ("Y681hXWwhQY", "6 Minute English — The benefits of doing nothing", "BBC Learning English", "B1", "6:19", "Thư giãn", "tone-b", "en"),
    ("m7IlyBEyi3c", "6 Minute English — Limiting screen time for children", "BBC Learning English", "B1", "6:25", "Trẻ em", "tone-c", "en"),
    ("h_pvijqmolQ", "6 Minute English — Why read books, not screens?", "BBC Learning English", "B1", "6:22", "Đọc sách", "tone-d", "en"),
    ("G2xWg2ckKHI", "Easy English 8 — What are you doing today? (phỏng vấn đường phố)", "Easy English", "A2", "3:33", "Đường phố", "tone-e", "en"),
    ("OlyYE6USuO0", "Easy English 29 — Talking about the future", "Easy English", "A2", "5:33", "Tương lai", "tone-f", "en"),
    ("kf0yY5ZBz6A", "Easy English 26 — If you won the lottery", "Easy English", "A2", "5:07", "Giả định", "tone-a", "en"),
]

DEFAULT_JA_VIDEOS = [
    ("_8b_ERSJ6_Q", "GENKI — Hội thoại bài 1: あたらしいともだち", "GENKI 日本語", "Sơ cấp", "1:15", "Hội thoại", "tone-a", "ja"),
    ("PweksFQGzmI", "Nhật ký buổi sáng ở Nhật (vlog có phụ đề)", "Japanese Vlog", "Sơ–trung cấp", "8:58", "Đời sống", "tone-b", "ja"),
    ("lNb98HLnkfs", "Nghe tiếng Nhật đơn giản — Đời sống gia đình", "Japanese Listening", "Sơ cấp", "56:03", "Gia đình", "tone-c", "ja"),
    ("4EeTnIV05j4", "Podcast tiếng Nhật — luyện nghe 1 giờ", "Japanese Podcast", "Trung cấp", "1:05:52", "Podcast", "tone-d", "ja"),
    ("rjmKQ-fjnyQ", "Nghe hiểu dễ — Cùng học ở công viên", "Nihongo-Learning", "Sơ cấp", "7:29", "公園", "tone-e", "ja"),
    ("Jh2C7JlWGKU", "Nghe hiểu dễ — Thói quen buổi sáng của tôi", "Nihongo-Learning", "Sơ cấp", "6:41", "朝のルーティン", "tone-f", "ja"),
    ("J62Y_9kuP_k", "Nghe hiểu dễ — 5 từ chỉ thời tiết", "Nihongo-Learning", "Sơ cấp", "9:18", "天気", "tone-a", "ja"),
    ("GUqFU5u7rLQ", "Truyện nghe hiểu #1 — Gia đình (sơ cấp)", "Japarrot", "Sơ cấp", "6:21", "家族", "tone-b", "ja"),
    ("OeQzO5g4Y1o", "Podcast Shun Ep3 — Nhật trình hằng ngày (Genki 1)", "Japanese with Shun", "N5", "6:31", "日課", "tone-c", "ja"),
    ("WIaVnPJ35Z4", "Hội thoại dễ 30 phút với khách mời (N5–N4)", "Japanese with Shun", "N5–N4", "27:31", "会話", "tone-d", "ja"),
    ("K32EfuTvPoM", "Nghe tự nhiên siêu dễ (JLPT N5)", "Japanese with Shun", "N5", "16:38", "聞き取り", "tone-e", "ja"),
]

DEFAULT_ZH_VIDEOS = [
    ("rwnyaH6cTDE", "15 hội thoại ở xe đồ ăn (HSK 1–2)", "Say Mandarin 說中文", "HSK 1–2", "22:44", "餐车对话", "tone-a", "zh"),
    ("MYQrQvbR8Vk", "Một ngày của tôi — hội thoại thực tế", "Chinese Daily Podcast", "HSK 1–2", "9:07", "我的一天", "tone-b", "zh"),
    ("DVRy3l9ojq4", "Vì sao học mãi vẫn chưa nói được tiếng Trung?", "Chinese Daily Podcast", "HSK 2–3", "18:57", "学中文", "tone-c", "zh"),
    ("oLHfnK9IVZs", "Vlog chậm — Hôm nay tôi ăn gì (nghe hiểu dễ)", "Jiayou Chinese", "HSK 1–3", "15:59", "美食", "tone-d", "zh"),
    ("LcUoiBwG-OA", "Dạo phố ẩm thực Trung Quốc — học qua vlog", "Lala Chinese 啦啦的中文课", "HSK 3", "10:31", "美食街", "tone-e", "zh"),
    ("97NV2txklwk", "Streettalk #4 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "7:56", "街头采访", "tone-f", "zh"),
]

DEFAULT_DE_VIDEOS = [
    ("iB_sassbnOw", "Bài 1 — Chào hỏi tiếng Đức (người mới bắt đầu)", "Learn German with Anja", "A1", "4:32", "Begrüßung", "tone-a", "de"),
    ("5aNdCmSruYA", "Bài 2 — Giới thiệu tên: Ich heiße…", "Learn German with Anja", "A1", "3:56", "Vorstellung", "tone-b", "de"),
    ("yyJ-dhmff-o", "Easy German 423 — Người Berlin mô tả ngoại hình", "Easy German", "A2–B1", "12:36", "Aussehen", "tone-c", "de"),
    ("Qo_kusD5oQ4", "Easy German 595 — Münster, hôm nay bạn làm gì?", "Easy German", "B1", "13:43", "Alltag", "tone-d", "de"),
    ("Lfoai_nP7lc", "Phỏng vấn đường phố — Tiền quan trọng với bạn thế nào?", "Easy German", "B1", "13:38", "Geld", "tone-e", "de"),
    ("kRq3WzSwUw0", "Phỏng vấn đường phố ở Magdeburg", "Easy German", "B1", "15:57", "Interview", "tone-f", "de"),
    ("86YgrypWSB0", "Easy German 435 — Cú sốc văn hoá của người Đức ở nước ngoài", "Easy German", "B1", "14:15", "Kultur", "tone-a", "de"),
    ("lE5FIV-76x0", "Hiểu tiếng Đức đường phố thật (Erfurt)", "Easy German", "B1", "15:03", "Straßendeutsch", "tone-b", "de"),
]

# Tiếng Việt cho người nước ngoài — ngôn ngữ học mới (GĐ 1, Tuần 3).
DEFAULT_VI_VIDEOS = [
    ("ZHstsAfN9AI", "Từ ĐI đa nghĩa — Đi ngủ! Đi chơi! Đi vào!", "Learn Vietnamese With Annie", "Sơ cấp", "2:45", "Từ vựng", "tone-a", "vi"),
    ("gWZ620nh_S0", "Easy Vietnamese 1 — Điều gì đặc trưng Việt Nam?", "Easy Vietnamese", "Sơ cấp", "4:30", "Đường phố", "tone-b", "vi"),
    ("Dps2_fUosJo", "Easy Vietnamese 2 — Phố đi bộ Nguyễn Huệ", "Easy Vietnamese", "Sơ cấp", "6:35", "Đường phố", "tone-c", "vi"),
    ("knJVlNiXjhQ", "Easy Vietnamese 3 — Chợ Hạnh Thông Tây", "Easy Vietnamese", "Sơ cấp", "5:13", "Chợ", "tone-d", "vi"),
    ("wB_LiN9bPOo", "Easy Vietnamese 4 — Phố sách cũ", "Easy Vietnamese", "Sơ cấp", "5:42", "Sách", "tone-e", "vi"),
    ("CvMfNAPLCz0", "Easy Vietnamese 8 — Việt Nam có đáng để du lịch?", "Easy Vietnamese", "Trung cấp", "9:49", "Du lịch", "tone-f", "vi"),
    ("eGJb4i_LRyw", "Easy Vietnamese 10 — Ngôn ngữ bạn thích học nhất?", "Easy Vietnamese", "Trung cấp", "12:04", "Ngôn ngữ", "tone-a", "vi"),
    ("xZMRzCoaboA", "CÀ PHÊ — luyện nghe tiếng Việt chậm", "HowToVietnamese", "Sơ cấp", "4:18", "Cà phê", "tone-b", "vi"),
]

# Bộ video mặc định theo từng ngôn ngữ (đồng bộ vào kho mỗi lần khởi động).
DEFAULT_LANG_VIDEOS = {
    "ko": DEFAULT_KO_VIDEOS,
    "en": DEFAULT_EN_VIDEOS,
    "ja": DEFAULT_JA_VIDEOS,
    "zh": DEFAULT_ZH_VIDEOS,
    "de": DEFAULT_DE_VIDEOS,
    "vi": DEFAULT_VI_VIDEOS,
}

DEFAULT_QUESTS = [
    ("q1", "Luyện phát âm 20 câu", "Thực hành phát âm với 20 câu", "daily", "pronounce", 50, 20, 1),
    ("q2", "Hoàn thành 5 bài học", "Hoàn thành 5 bài học trong ngày", "daily", "lesson", 100, 5, 1),
    ("q3", "Ôn 30 thẻ từ vựng", "Ôn tập 30 flashcard hôm nay", "daily", "review", 40, 30, 0),
    ("q4", "Dịch 1 video YouTube", "Dán link và tạo bài học từ video", "daily", "video", 30, 1, 0),
    ("q5", "Giữ chuỗi học 7 ngày", "Học liên tục 7 ngày trong tuần", "weekly", "streak", 250, 7, 0),
    ("q6", "Học 50 từ mới", "Thêm 50 từ vựng mới trong tuần", "weekly", "word", 200, 50, 0),
    ("q7", "Đăng nhập 10 ngày", "Nhiệm vụ đặc biệt cho Plus — đăng nhập 10 ngày trong tháng", "monthly", "login", 500, 10, 1),
]

DEFAULT_PLANS = [
    ("monthly", "Hằng tháng", "Dùng thử linh hoạt", "150.000đ", "99.000đ", "/tháng",
     "Ưu đãi chỉ áp dụng cho lần đầu tiên", "Chọn gói tháng", 30, 0),
    ("yearly", "Hằng năm", "Tiết kiệm nhất • phổ biến", "150.000đ/tháng", "69.000đ", "/tháng",
     "Tính theo năm • ưu đãi lần đầu tiên", "Chọn gói năm", 365, 1),
    ("lifetime", "Vĩnh viễn", "Trả một lần, học trọn đời", "50.999.999đ", "20.299.000đ", "một lần",
     "Ưu đãi chỉ áp dụng cho lần đầu tiên", "Sở hữu vĩnh viễn", 0, 0),
]

DEFAULT_PERKS = [
    "Toàn bộ tính năng trong gói Miễn phí",
    "Thêm bất kỳ video yêu thích nào",
    "Truy cập toàn bộ video trong kho",
    "Hỗ trợ video dài đến 2 giờ",
    "Phiên âm 30 giờ/tháng (tải video & luyện phát âm)",
    "Luyện phát âm với AI thông minh",
    "Mở khoá các tính năng kết hợp AI",
    "Không quảng cáo",
    "Học được tất cả ngôn ngữ",
    "Hỗ trợ 4 thiết bị: web, app mobile, iPad & hơn thế nữa",
]

DEFAULT_SHOP = [
    ("s-sun", "Hoa Hướng Dương", "Trồng và chăm sóc hoa hướng dương trong vườn", 99, "seed", "sunflower", 0),
    ("s-tulip", "Hoa Tulip", "Trồng và chăm sóc hoa tulip trong vườn", 99, "seed", "tulip", 0),
    ("s-lotus", "Hoa Sen", "Trồng và chăm sóc hoa sen trong vườn", 129, "seed", "lotus", 0),
    ("s-rose", "Hoa Hồng", "Trồng và chăm sóc hoa hồng trong vườn", 149, "seed", "rose", 0),
    ("s-sakura", "Anh Đào", "Cây anh đào nở rộ theo tiến độ học", 199, "seed", "sakura", 1),
    ("s-bamboo", "Trúc May Mắn", "Trúc xanh tươi tốt mỗi ngày học đều", 159, "seed", "bamboo", 0),
    ("f-aurora", "Aurora Cực Quang", "Khung viền ánh sáng cực quang chuyển động", 999, "frame", "aurora", 1),
    ("f-sakura", "Spirit Blossom", "Cánh hoa anh đào bay quanh avatar", 1299, "frame", "blossom", 1),
    ("f-flame", "Phượng Hoàng Lửa", "Ngọn lửa rực rỡ viền quanh", 1599, "frame", "flame", 1),
    ("f-ice", "Băng Giá", "Tinh thể băng lấp lánh", 800, "frame", "ice", 0),
    ("f-forest", "Forest Frolic", "Lá rừng xanh xoay nhẹ", 700, "frame", "forest", 0),
    ("f-galaxy", "Dải Ngân Hà", "Tinh vân và sao lấp lánh", 1888, "frame", "galaxy", 1),
    ("f-khung1", "Vầng Cực Quang", "Khung ánh sáng xanh vàng chuyển động thật quanh avatar", 1200, "frame", "v-khung1", 0),
    ("f-khung2", "Xoáy Thanh Lục", "Vòng xoáy lụa xanh ngọc uốn lượn quanh avatar", 1500, "frame", "v-khung2", 1),
    ("f-khung3", "Băng Tinh Vân", "Vòng hạt băng xanh lấp lánh bao quanh avatar", 1800, "frame", "v-khung3", 1),
    ("bg-nen1", "Mèo Bơi", "Chú mèo đen bơi giữa làn nước xanh dịu", 900, "background", "nen1", 0),
    ("bg-nen2", "Đại Dương Sâu", "Cá mập lướt giữa đại dương lấp lánh tia nắng", 1400, "background", "nen2", 1),
    ("bg-nen3", "Mắt Anh Đào", "Ánh mắt huyền ảo giữa cánh anh đào bay", 1600, "background", "nen3", 1),
    ("bg-nen4", "Mèo Thả Trôi", "Mèo con thả mình trôi trên mặt nước xanh", 900, "background", "nen4", 0),
    ("bg-nen5", "Ao Sen Ếch Con", "Ếch con nằm lá sen giữa ao nước trong veo", 1100, "background", "nen5", 0),
    ("bg-nen6", "Ánh Mắt Lấp Lánh", "Đôi mắt long lanh như ngàn vì sao", 1500, "background", "nen6", 1),
    ("a-glow", "Hào Quang", "Vầng sáng dịu quanh avatar", 300, "avatar", "glow", 0),
    ("a-spark", "Tia Sáng", "Những tia lấp lánh nhỏ", 350, "avatar", "spark", 0),
    ("b-star", "Huy Hiệu Ngôi Sao", "Hiển thị cạnh tên của bạn", 250, "badge", "star", 0),
    ("b-crown", "Vương Miện", "Danh hiệu cho cao thủ", 600, "badge", "crown", 1),
]

# Thú cưng nổi ở góc màn hình — đồng hành cùng bạn khi học.
# Hiện chỉ còn Shiba (ảnh thật, nhiều biểu cảm); các loài khác sẽ phát triển sau.
# Cơ chế seed bên dưới tự dọn mọi loài không có trong danh sách này khỏi cửa hàng.
DEFAULT_PETS = [
    ("p-shiba", "Cún Shiba", "Shiba ảnh thật với loạt biểu cảm sống động — tra từ vựng & cùng bạn tập trung Pomodoro", 0, "pet", "shiba", 0),
]


def seed() -> None:
    conn = db.get_conn()
    try:
        # Keep curated per-language libraries in sync on every startup so corrections
        # (e.g. replacing videos that YouTube made unavailable) reach existing databases.
        for code, vids in DEFAULT_LANG_VIDEOS.items():
            for i, v in enumerate(vids):
                conn.execute(
                    "INSERT INTO catalog_videos (id, title, channel, level, dur, topic, tone, lang, sort) "
                    "VALUES (?,?,?,?,?,?,?,?,?) "
                    "ON CONFLICT(id) DO UPDATE SET title=excluded.title, channel=excluded.channel, "
                    "level=excluded.level, dur=excluded.dur, topic=excluded.topic, tone=excluded.tone, "
                    "lang=excluded.lang, sort=excluded.sort",
                    (*v, 50 + i),
                )
            # Remove videos for this language no longer in the curated list.
            keep = [v[0] for v in vids]
            ph = ",".join("?" for _ in keep)
            conn.execute(
                f"DELETE FROM catalog_videos WHERE lang = ? AND id NOT IN ({ph})",
                (code, *keep),
            )
        if conn.execute("SELECT COUNT(*) AS n FROM catalog_quests").fetchone()["n"] == 0:
            for i, q in enumerate(DEFAULT_QUESTS):
                conn.execute(
                    "INSERT INTO catalog_quests (id, title, descr, period, metric, reward, target, plus, sort) "
                    "VALUES (?,?,?,?,?,?,?,?,?)",
                    (*q, i),
                )
        if conn.execute("SELECT COUNT(*) AS n FROM catalog_shop").fetchone()["n"] == 0:
            for i, s in enumerate(DEFAULT_SHOP):
                conn.execute(
                    "INSERT INTO catalog_shop (id, name, descr, price, category, art, plus, sort) "
                    "VALUES (?,?,?,?,?,?,?,?)",
                    (*s, i),
                )
        else:
            for i, s in enumerate(DEFAULT_SHOP):
                conn.execute(
                    "INSERT OR IGNORE INTO catalog_shop (id, name, descr, price, category, art, plus, sort) "
                    "VALUES (?,?,?,?,?,?,?,?)",
                    (*s, i),
                )
        if conn.execute("SELECT COUNT(*) AS n FROM catalog_plans").fetchone()["n"] == 0:
            for i, p in enumerate(DEFAULT_PLANS):
                conn.execute(
                    "INSERT INTO catalog_plans (id, name, tagline, original, price, unit, note, cta, days, featured, sort) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    (*p, i),
                )
        # Pets ship after the first seed — keep the roster (name/art/price) in
        # sync on every startup so design refreshes reach existing databases.
        for i, s in enumerate(DEFAULT_PETS):
            conn.execute(
                "INSERT INTO catalog_shop (id, name, descr, price, category, art, plus, sort) "
                "VALUES (?,?,?,?,?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, descr=excluded.descr, "
                "price=excluded.price, category=excluded.category, art=excluded.art, "
                "plus=excluded.plus, sort=excluded.sort",
                (*s, 100 + i),
            )
        # Dọn các loài cũ đã bỏ khỏi cửa hàng ở những database đã seed từ trước.
        keep = [p[0] for p in DEFAULT_PETS]
        placeholders = ",".join("?" for _ in keep)
        conn.execute(
            f"DELETE FROM catalog_shop WHERE category = 'pet' AND id NOT IN ({placeholders})",
            keep,
        )
        conn.commit()
    finally:
        conn.close()


def videos(active_only: bool = True) -> list[dict]:
    conn = db.get_conn()
    try:
        where = "WHERE active = 1" if active_only else ""
        rows = conn.execute(f"SELECT * FROM catalog_videos {where} ORDER BY sort, id").fetchall()
    finally:
        conn.close()
    return [
        {"id": r["id"], "title": r["title"], "channel": r["channel"], "level": r["level"],
         "dur": r["dur"], "topic": r["topic"], "tone": r["tone"],
         "lang": (r["lang"] if "lang" in r.keys() else "ko") or "ko", "active": bool(r["active"])}
        for r in rows
    ]


def quests(active_only: bool = True) -> list[dict]:
    conn = db.get_conn()
    try:
        where = "WHERE active = 1" if active_only else ""
        rows = conn.execute(f"SELECT * FROM catalog_quests {where} ORDER BY sort, id").fetchall()
    finally:
        conn.close()
    return [
        {"id": r["id"], "title": r["title"], "desc": r["descr"], "period": r["period"],
         "metric": r["metric"], "reward": r["reward"], "target": r["target"],
         "plus": bool(r["plus"]), "active": bool(r["active"])}
        for r in rows
    ]


def shop(active_only: bool = True) -> list[dict]:
    conn = db.get_conn()
    try:
        where = "WHERE active = 1" if active_only else ""
        rows = conn.execute(f"SELECT * FROM catalog_shop {where} ORDER BY sort, id").fetchall()
    finally:
        conn.close()
    return [
        {"id": r["id"], "name": r["name"], "desc": r["descr"], "price": r["price"],
         "category": r["category"], "art": r["art"], "plus": bool(r["plus"]), "active": bool(r["active"])}
        for r in rows
    ]


def plans(active_only: bool = True) -> list[dict]:
    conn = db.get_conn()
    try:
        where = "WHERE active = 1" if active_only else ""
        rows = conn.execute(f"SELECT * FROM catalog_plans {where} ORDER BY sort, id").fetchall()
    finally:
        conn.close()
    return [
        {"id": r["id"], "name": r["name"], "tagline": r["tagline"], "original": r["original"],
         "price": r["price"], "unit": r["unit"], "note": r["note"], "cta": r["cta"],
         "days": r["days"], "featured": bool(r["featured"]), "active": bool(r["active"])}
        for r in rows
    ]


def plan(plan_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT * FROM catalog_plans WHERE id = ?", (plan_id,)).fetchone()
    finally:
        conn.close()
    if not r:
        return None
    return {"id": r["id"], "name": r["name"], "days": r["days"], "active": bool(r["active"])}


def shop_item(item_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT * FROM catalog_shop WHERE id = ?", (item_id,)).fetchone()
    finally:
        conn.close()
    if not r:
        return None
    return {"id": r["id"], "name": r["name"], "price": r["price"], "category": r["category"],
            "art": r["art"], "plus": bool(r["plus"])}


_TABLES = {
    "videos": ("catalog_videos", {"id", "title", "channel", "level", "dur", "topic", "tone", "lang", "sort", "active"}),
    "quests": ("catalog_quests", {"id", "title", "descr", "period", "metric", "reward", "target", "plus", "sort", "active"}),
    "shop": ("catalog_shop", {"id", "name", "descr", "price", "category", "art", "plus", "sort", "active"}),
    "plans": ("catalog_plans", {"id", "name", "tagline", "original", "price", "unit", "note", "cta", "days", "featured", "sort", "active"}),
}
_INT_FIELDS = {"sort", "active", "plus", "reward", "target", "days", "featured"}


def upsert(kind: str, data: dict) -> dict:
    table, cols = _TABLES[kind]
    item_id = (data.get("id") or "").strip()
    if not item_id:
        raise HTTPException(status_code=400, detail="Thiếu mã (id).")
    payload = {k: v for k, v in data.items() if k in cols and k != "id"}
    for k in list(payload):
        if k in _INT_FIELDS and payload[k] is not None:
            payload[k] = int(payload[k])
    conn = db.get_conn()
    try:
        exists = conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (item_id,)).fetchone()
        if exists:
            if payload:
                sets = ", ".join(f"{k} = ?" for k in payload)
                conn.execute(f"UPDATE {table} SET {sets} WHERE id = ?", (*payload.values(), item_id))
        else:
            keys = ["id", *payload.keys()]
            placeholders = ",".join("?" for _ in keys)
            conn.execute(
                f"INSERT INTO {table} ({','.join(keys)}) VALUES ({placeholders})",
                (item_id, *payload.values()),
            )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "id": item_id}


def remove(kind: str, item_id: str) -> dict:
    table, _ = _TABLES[kind]
    conn = db.get_conn()
    try:
        conn.execute(f"DELETE FROM {table} WHERE id = ?", (item_id,))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}
