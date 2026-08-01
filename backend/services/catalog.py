from __future__ import annotations

from fastapi import HTTPException

from .. import db

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
    ("6puwb16HEZs", "Nhập môn A0 — Đầu vào dễ hiểu cho người mới hoàn toàn", "태웅쌤 - Comprehensible Input Korean", "Vỡ lòng", "50:24", "왕초보", "tone-a", "ko"),
    ("Oh8fiYihNhM", "Tiếng Hàn chậm & dễ hiểu cho người mới bắt đầu", "Ria Korea 리아 코리아", "Vỡ lòng", "8:10", "쉬운 한국어", "tone-b", "ko"),
    ("f91PZmjhZGA", "Một ngày của tôi — 하루 일과 (nói chậm, hình minh hoạ)", "Comprehensible Korean", "Vỡ lòng", "6:11", "하루 일과", "tone-c", "ko"),
    ("ZXoJ7NNFX8Q", "Podcast sơ cấp #16 — 고향 소개 (Giới thiệu quê hương)", "한국어 한 조각 A Piece Of Korean", "TOPIK 1", "6:23", "고향", "tone-d", "ko"),
    ("cHgmBScOGwI", "Hội thoại chậm & dễ cho người mới (trọn buổi)", "Kendra's Language School", "TOPIK 1", "43:53", "쉬운 대화", "tone-e", "ko"),
    ("6HFzeknPi2A", "Hội thoại cơ bản nói chậm — luyện nghe dài hơi", "Kendra's Language School", "TOPIK 1", "69:46", "기초 대화", "tone-f", "ko"),
    ("xUiHoufw_Pk", "25 phút nghe hiểu cho người mới hoàn toàn", "Learn Korean with KoreanClass101.com", "TOPIK 1", "23:19", "듣기 연습", "tone-a", "ko"),
    ("HDMnqs-JEhM", "Luyện nghe Cấp 1 — 12 đoạn hội thoại", "KOREAN FULL COURSE", "TOPIK 1", "24:35", "레벨 1 대화", "tone-b", "ko"),
    ("q6phk8Zy6sg", "1 giờ luyện nghe cho người mới ❷", "최수수 ChoiSusu", "TOPIK 1", "63:57", "듣기 1시간", "tone-c", "ko"),
    ("4UlLMVwQ5o0", "Nghe chậm có phụ đề & từ vựng #18 — 작은 습관 (Thói quen nhỏ)", "Korean with Sol", "TOPIK 1-2", "14:22", "습관", "tone-d", "ko"),
    ("GpmRPcCj8b0", "Nghe chậm có phụ đề & từ vựng #17 — 드라마 (Phim Hàn)", "Korean with Sol", "TOPIK 1-2", "12:23", "드라마", "tone-e", "ko"),
    ("6Y7VwFR5cDg", "1 giờ hội thoại tự nhiên — phụ đề Hàn/Anh", "Talk To Me In Korean", "TOPIK 2", "61:06", "자연스러운 대화", "tone-f", "ko"),
    ("4P_pkkh8ynA", "Podcast trung cấp #01 — 취미 생활 (Đời sống sở thích)", "최수수 ChoiSusu", "TOPIK 2", "6:43", "취미 생활", "tone-a", "ko"),
    ("D982vPFx2t8", "Podcast trung cấp #12 — 습관 (Thói quen)", "최수수 ChoiSusu", "TOPIK 2", "16:39", "습관", "tone-b", "ko"),
    ("M6UbE1wb9xc", "Podcast trung cấp #21 — Tôi thành giáo viên tiếng Hàn thế nào", "최수수 ChoiSusu", "TOPIK 2", "15:50", "직업 이야기", "tone-c", "ko"),
    ("OfM84gxU_lY", "Podcast trung cấp #22 — Vì sao tôi bắt đầu làm podcast", "최수수 ChoiSusu", "TOPIK 2", "13:10", "팟캐스트", "tone-d", "ko"),
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
    ("7_qg_KVByS0", "Mr Duncan — Lesson 1: Introduction (vỡ lòng)", "English Addict with Mr Duncan", "A1", "6:08", "Vỡ lòng", "tone-b", "en"),
    ("FWI9GEwJNzc", "Mr Duncan — How do I learn English?", "English Addict with Mr Duncan", "A1", "3:25", "Cách học", "tone-c", "en"),
    ("Uh_-j8BS-NM", "Mr Duncan — Lesson 2: Saying Hello", "English Addict with Mr Duncan", "A1", "3:37", "Chào hỏi", "tone-d", "en"),
    ("erjMgola4fQ", "A1 Listening Practice — Language Learning (nghe chậm)", "Listening Time", "A1", "3:43", "Nghe chậm", "tone-e", "en"),
    ("aQ0w2I0Eb9I", "A1 Listening Practice — Daily Routine", "Listening Time", "A1", "4:46", "Thói quen ngày", "tone-f", "en"),
    ("sMkzwmMs0jM", "A1 Podcast — Talk About Your Day", "Mr. English Channel", "A1", "11:04", "Kể chuyện ngày", "tone-a", "en"),
    ("s2EYIDY8wSM", "Podcast cho người mới bắt đầu — A1 Listening", "English Easy Practice", "A1", "8:54", "Podcast", "tone-b", "en"),
    ("QyJqFPI1Ww0", "The Treehouse Story — truyện ngắn nghe dễ (A2)", "Emma Daily English", "A2", "18:20", "Truyện ngắn", "tone-c", "en"),
    ("yUdhPFXRFmM", "Easy English 205 — What are your plans today?", "Easy British English", "A2", "11:32", "Đường phố", "tone-d", "en"),
    ("6xl8PD9gbF8", "Easy English 40 — Have you ever lived abroad?", "Easy Languages", "A2", "4:42", "Đường phố", "tone-e", "en"),
    ("HXTFwnAgWmM", "Podcast A2–B1 — Let's Talk About Money", "Mr. English Channel", "A2", "20:04", "Tiền bạc", "tone-f", "en"),
    ("oUD2gUmdzeI", "Spoken English Class 1 — luyện nói từ cơ bản", "English with Lucy", "B1", "16:29", "Luyện nói", "tone-a", "en"),
    ("0Okxsszt624", "English Leap Podcast — This Video Will Change Your Life", "Speak English With Class", "B1", "16:45", "Podcast", "tone-b", "en"),
    ("_5siHrpPnmw", "6 Minute English — The health benefits of apples", "BBC Learning English", "B1", "6:23", "Sức khoẻ", "tone-c", "en"),
    ("9hus12iCyL8", "6 Minute English — Can we boost the immune system?", "BBC Learning English", "B1", "6:14", "Miễn dịch", "tone-d", "en"),
    ("H5BVbrZ64bQ", "6 Minute English — Are we getting more allergic?", "BBC Learning English", "B1", "6:13", "Dị ứng", "tone-e", "en"),
    ("hUFj6sbOiPA", "English with Lucy — Daily Routine at C1 Level", "English with Lucy", "B2", "14:18", "Thói quen ngày", "tone-f", "en"),
    ("Ty3J0XGNpHg", "6 Minute English — Kiếm & ăn thức ăn hoang dã", "BBC Learning English", "B1", "6:19", "Đồ ăn", "tone-a", "en"),
    ("5kr5ADrMeYU", "6 Minute English — Làm quen văn hoá ẩm thực mới", "BBC Learning English", "B1", "6:22", "Ẩm thực", "tone-b", "en"),
    ("j2PdEQpu5js", "6 Minute English — Vì sao cần ngủ đủ giấc", "BBC Learning English", "B1", "6:19", "Giấc ngủ", "tone-c", "en"),
    ("NwPkZgd6L-o", "6 Minute English — Người sống ẩn dật (Hermits)", "BBC Learning English", "B1", "6:15", "Lối sống", "tone-d", "en"),
    ("tyvMjvvrq74", "6 Minute English — AI làm được và không làm được gì?", "BBC Learning English", "B2", "6:13", "Trí tuệ nhân tạo", "tone-e", "en"),
    ("KB4Mn5XHdMc", "6 Minute English — Tổng đài: bạn đang nói với AI?", "BBC Learning English", "B2", "6:14", "Công nghệ", "tone-f", "en"),
    ("0R9NLQM4ZKA", "6 Minute English — Huấn luyện trí tuệ nhân tạo", "BBC Learning English", "B2", "6:34", "Trí tuệ nhân tạo", "tone-a", "en"),
    ("tHZRXN_pVi8", "6 Minute English — AI có thể có suy nghĩ riêng?", "BBC Learning English", "B2", "6:20", "Trí tuệ nhân tạo", "tone-b", "en"),
    ("2FrA6kHzVQ4", "BOX SET 6 Minute English — Nghệ thuật & Văn hoá (30′)", "BBC Learning English", "B2", "30:31", "Nghệ thuật", "tone-c", "en"),
    ("CYcYeTaBRvE", "BOX SET 6 Minute English — Tương lai (30′)", "BBC Learning English", "B2", "30:33", "Tương lai", "tone-d", "en"),
    ("m9LyXOBmQvo", "BOX SET 6 Minute English — Kinh doanh & Công việc (30′)", "BBC Learning English", "B2", "30:28", "Công việc", "tone-e", "en"),
    ("xnnTR_T7SQ4", "BOX SET 6 Minute English — Tâm lý học (30′)", "BBC Learning English", "B2", "30:30", "Tâm lý", "tone-f", "en"),
    ("0EPYNMJv-oQ", "BOX SET 6 Minute English — Trí tuệ nhân tạo (30′)", "BBC Learning English", "B2", "30:32", "Trí tuệ nhân tạo", "tone-a", "en"),
    ("idrbwnWLJ7w", "TED-Ed — Thức trắng đêm ảnh hưởng não bộ thế nào", "TED-Ed", "B2", "5:37", "Não bộ", "tone-b", "en"),
    ("QEzlsjAqADA", "TED-Ed — Vì sao ong mật yêu hình lục giác?", "TED-Ed", "B1", "3:58", "Khoa học", "tone-c", "en"),
    ("2W85Dwxx218", "TED-Ed — Vì sao chúng ta lại nằm mơ?", "TED-Ed", "B1", "5:38", "Giấc mơ", "tone-d", "en"),
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

DEFAULT_PETS = [
    ("p-shiba", "Cún Shiba", "Shiba ảnh thật với loạt biểu cảm sống động — tra từ vựng & cùng bạn tập trung Pomodoro", 0, "pet", "shiba", 0),
]


def seed() -> None:
    conn = db.get_conn()
    try:
        for code, vids in DEFAULT_LANG_VIDEOS.items():
            for i, v in enumerate(vids):
                conn.execute(
                    "INSERT INTO catalog_videos (id, title, channel, level, dur, topic, tone, lang, sort) "
                    "VALUES (?,?,?,?,?,?,?,?,?) "
                    "ON CONFLICT(id) DO UPDATE SET title=excluded.title, channel=excluded.channel, "
                    "level=excluded.level, dur=excluded.dur, topic=excluded.topic, tone=excluded.tone, "
                    "lang=excluded.lang, sort=excluded.sort "
                    "WHERE catalog_videos.custom = 0",
                    (*v, 50 + i),
                )
            keep = [v[0] for v in vids]
            ph = ",".join("?" for _ in keep)
            conn.execute(
                f"DELETE FROM catalog_videos WHERE lang = ? AND custom = 0 AND id NOT IN ({ph})",
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
        for i, s in enumerate(DEFAULT_PETS):
            conn.execute(
                "INSERT INTO catalog_shop (id, name, descr, price, category, art, plus, sort) "
                "VALUES (?,?,?,?,?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, descr=excluded.descr, "
                "price=excluded.price, category=excluded.category, art=excluded.art, "
                "plus=excluded.plus, sort=excluded.sort "
                "WHERE catalog_shop.custom = 0",
                (*s, 100 + i),
            )
        keep = [p[0] for p in DEFAULT_PETS]
        placeholders = ",".join("?" for _ in keep)
        conn.execute(
            f"DELETE FROM catalog_shop WHERE category = 'pet' AND custom = 0 AND id NOT IN ({placeholders})",
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
_CUSTOM_TABLES = {"catalog_videos", "catalog_shop"}


def upsert(kind: str, data: dict) -> dict:
    table, cols = _TABLES[kind]
    item_id = (data.get("id") or "").strip()
    if not item_id:
        raise HTTPException(status_code=400, detail="Thiếu mã (id).")
    payload = {k: v for k, v in data.items() if k in cols and k != "id"}
    for k in list(payload):
        if k in _INT_FIELDS and payload[k] is not None:
            payload[k] = int(payload[k])
    if table in _CUSTOM_TABLES:
        payload["custom"] = 1
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
