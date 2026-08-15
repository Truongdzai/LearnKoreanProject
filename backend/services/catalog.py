from __future__ import annotations

from fastapi import HTTPException

from .. import db
from . import topics

DEFAULT_KO_VIDEOS = [
    ("GnwIG51ah7k", "Podcast cho người mới #01 — 취미 (Sở thích)", "최수수 ChoiSusu", "TOPIK 1", "3:58", "취미", "tone-a", "ko"),
    ("U_ZzQIV5KgM", "Podcast cho người mới #02 — 날씨와 계절 (Thời tiết & mùa)", "최수수 ChoiSusu", "TOPIK 1", "7:13", "날씨", "tone-b", "ko"),
    ("8rvv4RXQYb4", "Nghe chậm — 자기소개 (Giới thiệu bản thân)", "Korean with Mina", "TOPIK 1", "7:31", "자기소개", "tone-f", "ko"),
    ("kHsEZUcyD7c", "Nghe chậm lặp lại — luyện phản xạ", "Korean with Mina", "TOPIK 1", "5:22", "반복 듣기", "tone-a", "ko"),
    ("tpnmeXH9VZ4", "Truyện ngắn A1 — 우리 가족 (Gia đình tôi)", "몰입한국어 Immersion", "Vỡ lòng", "5:50", "우리 가족", "tone-c", "ko"),
    ("9lOJxJBRj1I", "Nghe hiểu dễ — Ở tiệm kem 🍦", "Daily Korean with Jaerim", "TOPIK 1", "5:34", "아이스크림", "tone-a", "ko"),
    ("IGEj-oDKyw8", "Nghe hiểu dễ — Ở cửa hàng tiện lợi", "Daily Korean with Jaerim", "TOPIK 1", "9:40", "편의점", "tone-b", "ko"),
    ("paToZla2CK8", "Nghe hiểu dễ — Đi siêu thị", "Daily Korean with Jaerim", "TOPIK 1", "7:16", "슈퍼마켓", "tone-c", "ko"),
    ("GGFJvv7fyqY", "Phỏng vấn đường phố — Người Hàn nghĩ gì về người học tiếng Hàn?", "On the spot Korea", "TOPIK 2", "8:35", "인터뷰", "tone-f", "ko"),
    ("Oh8fiYihNhM", "Tiếng Hàn chậm & dễ hiểu cho người mới bắt đầu", "Ria Korea 리아 코리아", "Vỡ lòng", "8:10", "쉬운 한국어", "tone-b", "ko"),
    ("f91PZmjhZGA", "Một ngày của tôi — 하루 일과 (nói chậm, hình minh hoạ)", "Comprehensible Korean", "Vỡ lòng", "6:11", "하루 일과", "tone-c", "ko"),
    ("ZXoJ7NNFX8Q", "Podcast sơ cấp #16 — 고향 소개 (Giới thiệu quê hương)", "한국어 한 조각 A Piece Of Korean", "TOPIK 1", "6:23", "고향", "tone-d", "ko"),
    ("4P_pkkh8ynA", "Podcast trung cấp #01 — 취미 생활 (Đời sống sở thích)", "최수수 ChoiSusu", "TOPIK 2", "6:43", "취미 생활", "tone-a", "ko"),

    ("sGAqzZFuewg", "Luyện phát âm — 140 tổ hợp phụ âm + nguyên âm", "Learn Korean ABC 가나다쌤", "Vỡ lòng", "10:00", "Bảng chữ", "tone-e", "ko"),

    ("sx0yyQqkpqo", "Billy Go #1 — Giới thiệu khoá tiếng Hàn sơ cấp", "GO! Billy Korean", "Vỡ lòng", "4:46", "Ngữ pháp", "tone-b", "ko"),
    ("U49SJ-evntU", "Billy Go #2 — Nhập môn 한글", "GO! Billy Korean", "Vỡ lòng", "9:55", "Bảng chữ", "tone-c", "ko"),
    ("YzpwHrA_iQQ", "Billy Go #3 — Học 한글 phần 1: những chữ đầu tiên", "GO! Billy Korean", "Vỡ lòng", "7:56", "Bảng chữ", "tone-d", "ko"),
    ("GfG_BCx35rQ", "Ngữ pháp bài 1 — 이에요/예요 (giảng bằng tiếng Hàn)", "TeacherKorean", "TOPIK 1", "5:24", "Ngữ pháp", "tone-e", "ko"),
    ("Cxu3ZB2QtWU", "Billy Go #91 — Cấu trúc diễn đạt 'phải làm gì đó'", "GO! Billy Korean", "TOPIK 2", "7:57", "Ngữ pháp", "tone-a", "ko"),

    ("8KqrxZgr30E", "News In Korean — nghe hiểu tin tức tiếng Hàn", "Talk To Me In Korean", "TOPIK 3", "3:22", "Tin tức", "tone-b", "ko"),
    ("FPohS5GUM7U", "Cách học với bài báo tiếng Hàn", "Talk To Me In Korean", "TOPIK 3", "4:12", "Tin tức", "tone-c", "ko"),

    ("woQrHL4Gq10", "Pinkfong — 아리랑 (dân ca Arirang)", "Pinkfong", "Vỡ lòng", "1:52", "Dân ca", "tone-d", "ko"),
    ("-_eW0dui684", "Học tiếng Hàn qua đồng dao 나비야 (Con bướm)", "Korean Unnie 한국언니", "Vỡ lòng", "3:48", "Đồng dao", "tone-e", "ko"),
    ("cgVGY3ErU1I", "Học tiếng Hàn qua lời K-pop — chữ 와", "DareDB", "TOPIK 1", "5:53", "Lời K-pop", "tone-a", "ko"),
    ("mHl_fTOO3qE", "Cách tự học tiếng Hàn qua lời bài hát", "Kochija Language Diary", "TOPIK 2", "6:49", "Học qua nhạc", "tone-b", "ko"),

    ("xBuYvX5kJl0", "Đầu vào dễ hiểu — 점심 (Bữa trưa kiểu Hàn)", "Comprehensible Korean", "Vỡ lòng", "1:42", "점심", "tone-c", "ko"),
    ("lYEfvaZeamI", "Đầu vào dễ hiểu — 미용실 (Đi cắt tóc)", "Comprehensible Korean", "Vỡ lòng", "2:41", "미용실", "tone-d", "ko"),
    ("Och9p-WqPTg", "Đầu vào dễ hiểu — Hôm nay tôi đi tiêm", "Comprehensible Korean", "Vỡ lòng", "2:42", "병원", "tone-e", "ko"),
    ("j5E1jIft05c", "Đầu vào dễ hiểu — 수지는 뭘 살까? (Sooji sẽ mua gì?)", "Comprehensible Korean", "Vỡ lòng", "2:54", "쇼핑", "tone-f", "ko"),
    ("tkhYt-EAjls", "Đầu vào dễ hiểu — 코코넛 (Quả dừa)", "Comprehensible Korean", "Vỡ lòng", "3:19", "과일", "tone-a", "ko"),
    ("uLjRKxEYeA0", "Đầu vào dễ hiểu — Đàn bò trên núi", "Comprehensible Korean", "Vỡ lòng", "4:34", "동물", "tone-b", "ko"),
    ("VXMm-HBVa14", "Đầu vào dễ hiểu — Món không thể thiếu mùa hè", "Comprehensible Korean", "Vỡ lòng", "5:43", "여름", "tone-c", "ko"),
    ("WzArpPGLghw", "Đầu vào dễ hiểu — 마트 (Đi siêu thị)", "Comprehensible Korean", "Vỡ lòng", "6:21", "마트", "tone-d", "ko"),
    ("Q7_UmOUi1XE", "Nghe hiểu dễ — 떡국 (Canh bánh gạo ngày Tết)", "Daily Korean with Jaerim", "TOPIK 1", "5:16", "떡국", "tone-e", "ko"),
    ("ddDyB0MGxJs", "Nghe hiểu dễ — Chơi máy gắp thú", "Daily Korean with Jaerim", "TOPIK 1", "6:27", "인형뽑기", "tone-f", "ko"),
    ("ewL6SaZzjyU", "Nghe hiểu dễ — Ở tiệm làm tóc", "Daily Korean with Jaerim", "TOPIK 1", "6:35", "미용실", "tone-a", "ko"),
    ("dpzJkC7hptY", "Nghe hiểu dễ — Dạo bộ ở Seoul", "Daily Korean with Jaerim", "TOPIK 1", "7:00", "서울 산책", "tone-b", "ko"),
    ("eXgzit1jiwI", "Nghe hiểu dễ — Dạo phố Istanbul", "Daily Korean with Jaerim", "TOPIK 1", "9:09", "이스탄불", "tone-c", "ko"),
    ("LhM41EH6Z0Q", "Podcast chậm #1 — 커피 (Cà phê)", "Korean with Mina", "TOPIK 1", "6:20", "커피", "tone-d", "ko"),
    ("SCwXfXWfqgY", "Podcast chậm #2 — 커피 (Cà phê)", "Korean with Mina", "TOPIK 1", "6:56", "커피", "tone-e", "ko"),
    ("GrNp-U5MfCE", "Podcast chậm — 근황 (Chuyển nhà, đi Tokyo)", "Korean with Mina", "TOPIK 1", "6:27", "근황", "tone-f", "ko"),
    ("8IncHz1vfLo", "Podcast chậm — 게임 (Trò chơi)", "Korean with Mina", "TOPIK 1", "7:56", "게임", "tone-a", "ko"),
    ("kubL3OtqpME", "Nghe lặp lại — dạo này tôi xem gì", "Korean with Mina", "TOPIK 1-2", "8:49", "요즘 본 것", "tone-b", "ko"),
    ("yd9cy9AhaOk", "Podcast — Vì sao nên học tiếng Hàn trong vui vẻ", "Korean with Mina", "TOPIK 2", "9:12", "학습법", "tone-c", "ko"),
    ("Qf6dN4n0d6s", "Cách luyện nghe tiếng Hàn cho thật vui", "Korean with Mina", "TOPIK 2", "9:30", "듣기 연습", "tone-d", "ko"),
]

DEFAULT_EN_VIDEOS = [
    ("aN78Tz_e5c4", "We Bare Bears — Một ngày ở biển", "Cartoon Network Asia", "B1", "3:24", "Đi biển", "tone-a", "en"),
    ("sN_vqwoC53Q", "We Bare Bears — Ba anh em thân nhất quả đất", "Cartoon Network Asia", "B1", "4:45", "Tình anh em", "tone-b", "en"),
    ("EzZ5Abh8xTM", "We Bare Bears — Màn kết bên chiếc pizza", "Cartoon Network Asia", "B1", "5:34", "Đồ ăn", "tone-c", "en"),
    ("xfc1j4rpw0c", "We Bare Bears — Ba anh em quậy tung", "Cartoon Network Asia", "B1", "8:43", "Hài hước", "tone-d", "en"),
    ("Oaha-hNJT4E", "We Bare Bears — Đối đầu kẻ phá đám trên mạng", "Cartoon Network Asia", "B2", "13:44", "Internet", "tone-e", "en"),
    ("RfciUa586VI", "We Bare Bears — Những khoảnh khắc của Ice Bear", "Cartoon Network Asia", "B1", "14:35", "Nhân vật", "tone-f", "en"),
    ("ZTFnT7IzdBQ", "We Bare Bears — Ăn không ngừng nghỉ", "Cartoon Network Asia", "B1", "16:02", "Đồ ăn", "tone-a", "en"),
    ("4474zOLzD8k", "We Bare Bears — Mùa hè vui ở trại", "Cartoon Network Asia", "B1", "16:57", "Cắm trại", "tone-b", "en"),
    ("Khtdwww58h4", "We Bare Bears — Những lần Panda phải lòng", "Cartoon Network", "B1", "17:10", "Tình cảm", "tone-c", "en"),
    ("u50iAtNCMQc", "We Bare Bears — Ba anh em đi hẹn hò", "Cartoon Network Asia", "B2", "17:25", "Hẹn hò", "tone-d", "en"),
    ("iqoEGCxJy3g", "We Bare Bears — Ba anh em lên truyền hình", "Cartoon Network Asia", "B2", "19:16", "Truyền hình", "tone-e", "en"),
    ("WQO5wXCGNW8", "We Bare Bears — Vì sao Ice Bear ngầu nhất", "Cartoon Network Asia", "B1", "23:07", "Nhân vật", "tone-f", "en"),
    ("C5kR-exHmr4", "We Bare Bears — Nguồn gốc ba anh em (Phần 2)", "Cartoon Network", "B2", "23:55", "Nguồn gốc", "tone-a", "en"),
    ("EUZnjEEh2DU", "We Bare Bears — Gấu ở những nơi bất ngờ (Phần 1)", "Cartoon Network Asia", "B2", "24:48", "Phiêu lưu", "tone-b", "en"),
    ("8-gyMEyeC54", "We Bare Bears — Khoảnh khắc mát lạnh ngày hè", "Cartoon Network Asia", "B1", "24:58", "Mùa hè", "tone-c", "en"),
]

DEFAULT_JA_VIDEOS = [
    ("_8b_ERSJ6_Q", "GENKI — Hội thoại bài 1: あたらしいともだち", "GENKI 日本語", "Sơ cấp", "1:15", "Hội thoại", "tone-a", "ja"),
    ("PweksFQGzmI", "Nhật ký buổi sáng ở Nhật (vlog có phụ đề)", "Japanese Vlog", "Sơ–trung cấp", "8:58", "Đời sống", "tone-b", "ja"),
    ("rjmKQ-fjnyQ", "Nghe hiểu dễ — Cùng học ở công viên", "Nihongo-Learning", "Sơ cấp", "7:29", "公園", "tone-e", "ja"),
    ("Jh2C7JlWGKU", "Nghe hiểu dễ — Thói quen buổi sáng của tôi", "Nihongo-Learning", "Sơ cấp", "6:41", "朝のルーティン", "tone-f", "ja"),
    ("J62Y_9kuP_k", "Nghe hiểu dễ — 5 từ chỉ thời tiết", "Nihongo-Learning", "Sơ cấp", "9:18", "天気", "tone-a", "ja"),
    ("GUqFU5u7rLQ", "Truyện nghe hiểu #1 — Gia đình (sơ cấp)", "Japarrot", "Sơ cấp", "6:21", "家族", "tone-b", "ja"),
    ("OeQzO5g4Y1o", "Podcast Shun Ep3 — Nhật trình hằng ngày (Genki 1)", "Japanese with Shun", "N5", "6:31", "日課", "tone-c", "ja"),
    ("aczPsLhpDRE", "3 quy tắc lịch sự cần biết ở Nhật", "Nihongo-Learning", "Sơ cấp", "4:04", "マナー", "tone-d", "ja"),
    ("ecG1j5zBcrY", "Những món ăn biểu tượng của Nhật", "Nihongo-Learning", "Sơ cấp", "4:08", "食べ物", "tone-e", "ja"),
    ("zcZIkpMBs14", "Những vật màu đỏ đặc trưng Nhật Bản", "Nihongo-Learning", "Sơ cấp", "4:41", "赤いもの", "tone-f", "ja"),
    ("G-ArHStBCN8", "Nghe hiểu dễ — 朝 (Buổi sáng của tôi)", "Nihongo-Learning", "Sơ cấp", "4:57", "朝", "tone-a", "ja"),
    ("xNx-FZ4Sj78", "Nghe hiểu dễ — 春 (Mùa xuân ở Nhật)", "Nihongo-Learning", "Sơ cấp", "5:10", "春", "tone-b", "ja"),
    ("TfoThmNj_rM", "Bạn biết bao nhiêu từ tượng thanh tiếng Nhật?", "Nihongo-Learning", "Sơ cấp", "6:13", "擬音語", "tone-c", "ja"),
    ("fXdYSlTMZxo", "Màu truyền thống Nhật Bản và câu chuyện phía sau", "Nihongo-Learning", "Sơ–trung cấp", "7:48", "伝統色", "tone-d", "ja"),
    ("ooQNETO4dK0", "Nâng cấp kỹ năng trò chuyện tiếng Nhật", "Nihongo-Learning", "Sơ–trung cấp", "9:48", "会話", "tone-e", "ja"),
    ("P_1yJRt6dQ4", "Truyện nghe hiểu #5 — 回転寿司 (Sushi băng chuyền)", "Japarrot", "Sơ cấp", "6:58", "回転寿司", "tone-f", "ja"),
    ("jiKnI3rjx54", "Truyện nghe hiểu #4 — 日本の家 (Nhà ở Nhật)", "Japarrot", "Sơ cấp", "9:11", "日本の家", "tone-a", "ja"),
    ("dx8o756L7NA", "Truyện nghe hiểu #7 — コンビニ (Cửa hàng tiện lợi)", "Japarrot", "Sơ cấp", "9:28", "コンビニ", "tone-b", "ja"),
    ("nawe0Nl93IA", "Tuyển tập truyện nghe hiểu #1–#5", "Japarrot", "Sơ cấp", "9:33", "聞き取り", "tone-c", "ja"),
    ("OJdonDT1Um8", "Podcast Shun #147 — 夜のルーティン (Thói quen buổi tối)", "Japanese with Shun", "N5–N4", "9:31", "夜のルーティン", "tone-d", "ja"),
    ("fTlCyr_nh7g", "Nghe tiếng Nhật thật ở Kyoto (N5)", "Japanese with Shun", "N5", "9:49", "京都", "tone-e", "ja"),
]

DEFAULT_ZH_VIDEOS = [
    ("MYQrQvbR8Vk", "Một ngày của tôi — hội thoại thực tế", "Chinese Daily Podcast", "HSK 1–2", "9:07", "我的一天", "tone-b", "zh"),
    ("97NV2txklwk", "Streettalk #4 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "7:56", "街头采访", "tone-f", "zh"),
    ("4N33a-_OpJw", "Vlog chậm — buổi sáng của tôi", "Jiayou Chinese", "HSK 1–3", "9:01", "早晨日常", "tone-d", "zh"),
    ("ive5H8hCBFs", "Vlog chậm — đi siêu thị mua đồ", "Jiayou Chinese", "HSK 1–3", "7:20", "超市", "tone-e", "zh"),
    ("mFb20gVBKI0", "Vlog chậm — dạo phố ngoại ô nước Đức", "Jiayou Chinese", "HSK 1–3", "9:40", "散步", "tone-b", "zh"),
    ("2DReT9aUIVE", "Vlog chậm — những ngày ở Paris", "Jiayou Chinese", "HSK 1–3", "8:32", "旅行", "tone-c", "zh"),
    ("b0cr38_Yo0k", "Vì sao chào hỏi của bạn nghe chưa tự nhiên", "Lala Chinese 啦啦的中文课", "HSK 1–2", "7:46", "打招呼", "tone-f", "zh"),
    ("c1Pz6H6YLQQ", "Streettalk #3 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:43", "街头采访", "tone-d", "zh"),
    ("rhhLFw1PfT4", "Streettalk #5 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:40", "街头采访", "tone-e", "zh"),
    ("VDpnJoeoIrQ", "Streettalk #6 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:13", "街头采访", "tone-f", "zh"),
    ("XnXhcCF8tcc", "Streettalk #7 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "7:29", "街头采访", "tone-a", "zh"),
    ("KAICBWsW8XM", "Streettalk #8 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "5:09", "街头采访", "tone-b", "zh"),
    ("zPC5xVe3Yrk", "Streettalk #9 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:20", "街头采访", "tone-c", "zh"),
    ("7UDcz1eDz5s", "Hội thoại — kế hoạch giảm cân", "Better in Chinese", "HSK 2–3", "3:16", "健康对话", "tone-d", "zh"),
    ("r0yawVo9KCo", "Nghe hiểu dễ — Điều tôi thích ở nước Đức", "Jiayou Chinese", "HSK 2–3", "7:09", "德国", "tone-e", "zh"),
    ("YVvJL3ib_HY", "Lần đầu nếm món Vân Nam", "Lala Chinese 啦啦的中文课", "HSK 2–3", "8:03", "云南美食", "tone-f", "zh"),
    ("wDa4lQVGl1U", "Tiếng Trung đời thật — một ngày leo núi", "Lala Chinese 啦啦的中文课", "HSK 2–3", "8:26", "爬山", "tone-a", "zh"),
    ("bKwHWyND8pY", "Nghe hiểu dễ — 爱好 (Sở thích của tôi)", "Jiayou Chinese", "HSK 2–3", "8:29", "爱好", "tone-b", "zh"),
    ("6lNH730Nscg", "Học tiếng Trung khi đi du lịch — hỏi đường", "Lala Chinese 啦啦的中文课", "HSK 2–3", "8:47", "问路", "tone-c", "zh"),
    ("XMoazr8vaxA", "Từ đồng âm và phong tục ngày Tết", "Lala Chinese 啦啦的中文课", "HSK 3", "8:56", "春节", "tone-d", "zh"),
    ("TbcpnpaUwdw", "Vlog chậm — cùng làm trà sữa", "Jiayou Chinese", "HSK 1–3", "9:11", "奶茶", "tone-e", "zh"),
    ("8jv9LMi45lY", "Nghỉ hưu ở Trung Quốc tốn bao nhiêu?", "Lala Chinese 啦啦的中文课", "HSK 3–4", "9:49", "退休", "tone-f", "zh"),
]

DEFAULT_LANG_VIDEOS = {
    "ko": DEFAULT_KO_VIDEOS,
    "en": DEFAULT_EN_VIDEOS,
    "ja": DEFAULT_JA_VIDEOS,
    "zh": DEFAULT_ZH_VIDEOS,
}

MAX_DUR_SECONDS = 1800


def dur_seconds(dur: str) -> int:
    parts = (dur or "").split(":")
    total = 0
    for p in parts:
        total = total * 60 + (int(p) if p.strip().isdigit() else 0)
    return total

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
        for code, all_vids in DEFAULT_LANG_VIDEOS.items():
            vids = sorted(
                (v for v in all_vids if dur_seconds(v[4]) <= MAX_DUR_SECONDS),
                key=lambda v: dur_seconds(v[4]),
            )
            for i, v in enumerate(vids):
                tags = topics.encode(topics.tags_for(v[0], v[1], v[2], v[5], v[3]))
                conn.execute(
                    "INSERT INTO catalog_videos (id, title, channel, level, dur, topic, tone, lang, tags, sort) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?) "
                    "ON CONFLICT(id) DO UPDATE SET title=excluded.title, channel=excluded.channel, "
                    "level=excluded.level, dur=excluded.dur, topic=excluded.topic, tone=excluded.tone, "
                    "lang=excluded.lang, tags=excluded.tags, sort=excluded.sort "
                    "WHERE catalog_videos.custom = 0",
                    (*v, tags, 50 + i),
                )
            keep = [v[0] for v in vids]
            ph = ",".join("?" for _ in keep)
            conn.execute(
                f"DELETE FROM catalog_videos WHERE lang = ? AND custom = 0 AND id NOT IN ({ph})",
                (code, *keep),
            )
        langs = list(DEFAULT_LANG_VIDEOS)
        ph = ",".join("?" for _ in langs)
        conn.execute(f"DELETE FROM catalog_videos WHERE lang NOT IN ({ph})", langs)
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
         "lang": (r["lang"] if "lang" in r.keys() else "ko") or "ko",
         "tags": topics.decode(r["tags"] if "tags" in r.keys() else ""),
         "active": bool(r["active"])}
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
    "videos": ("catalog_videos", {"id", "title", "channel", "level", "dur", "topic", "tone", "lang", "tags", "sort", "active"}),
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
    if kind == "videos" and dur_seconds(payload.get("dur") or "") > MAX_DUR_SECONDS:
        raise HTTPException(
            status_code=400,
            detail=f"Kho video chỉ nhận video tối đa {MAX_DUR_SECONDS // 60} phút.",
        )
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
