from __future__ import annotations

from fastapi import HTTPException

from .. import db
from . import topics

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

    ("sGAqzZFuewg", "Luyện phát âm — 140 tổ hợp phụ âm + nguyên âm", "Learn Korean ABC 가나다쌤", "Vỡ lòng", "10:00", "Bảng chữ", "tone-e", "ko"),
    ("oI9wswL_i5c", "Phát âm tiếng Hàn 01 — 연음 (nối âm)", "베이직 코리안 Basic Korean", "TOPIK 1", "10:06", "Nối âm", "tone-f", "ko"),
    ("r8MemnlRTbs", "Quy tắc phát âm — 비음화 (biến âm mũi)", "HANIJEMI Korean Lesson", "TOPIK 2", "16:18", "Phát âm", "tone-a", "ko"),

    ("sx0yyQqkpqo", "Billy Go #1 — Giới thiệu khoá tiếng Hàn sơ cấp", "GO! Billy Korean", "Vỡ lòng", "4:46", "Ngữ pháp", "tone-b", "ko"),
    ("U49SJ-evntU", "Billy Go #2 — Nhập môn 한글", "GO! Billy Korean", "Vỡ lòng", "9:55", "Bảng chữ", "tone-c", "ko"),
    ("YzpwHrA_iQQ", "Billy Go #3 — Học 한글 phần 1: những chữ đầu tiên", "GO! Billy Korean", "Vỡ lòng", "7:56", "Bảng chữ", "tone-d", "ko"),
    ("GfG_BCx35rQ", "Ngữ pháp bài 1 — 이에요/예요 (giảng bằng tiếng Hàn)", "TeacherKorean", "TOPIK 1", "5:24", "Ngữ pháp", "tone-e", "ko"),
    ("k3j8rzA9rA4", "Billy Go #20 — Nhập môn chia động từ", "GO! Billy Korean", "TOPIK 1", "19:59", "Chia động từ", "tone-f", "ko"),
    ("Cxu3ZB2QtWU", "Billy Go #91 — Cấu trúc diễn đạt 'phải làm gì đó'", "GO! Billy Korean", "TOPIK 2", "7:57", "Ngữ pháp", "tone-a", "ko"),

    ("8KqrxZgr30E", "News In Korean — nghe hiểu tin tức tiếng Hàn", "Talk To Me In Korean", "TOPIK 3", "3:22", "Tin tức", "tone-b", "ko"),
    ("FPohS5GUM7U", "Cách học với bài báo tiếng Hàn", "Talk To Me In Korean", "TOPIK 3", "4:12", "Tin tức", "tone-c", "ko"),

    ("woQrHL4Gq10", "Pinkfong — 아리랑 (dân ca Arirang)", "Pinkfong", "Vỡ lòng", "1:52", "Dân ca", "tone-d", "ko"),
    ("-_eW0dui684", "Học tiếng Hàn qua đồng dao 나비야 (Con bướm)", "Korean Unnie 한국언니", "Vỡ lòng", "3:48", "Đồng dao", "tone-e", "ko"),
    ("WqIw2W2nEzU", "Tuyển tập đồng dao Hàn Quốc 30 phút", "Learn Korean with Woori Show", "Vỡ lòng", "32:41", "Đồng dao", "tone-f", "ko"),
    ("cgVGY3ErU1I", "Học tiếng Hàn qua lời K-pop — chữ 와", "DareDB", "TOPIK 1", "5:53", "Lời K-pop", "tone-a", "ko"),
    ("mHl_fTOO3qE", "Cách tự học tiếng Hàn qua lời bài hát", "Kochija Language Diary", "TOPIK 2", "6:49", "Học qua nhạc", "tone-b", "ko"),
    ("cNlhoyoe_os", "Lời K-pop — 100 cách nói thân mật hằng ngày", "Learn Korean with Hoya", "TOPIK 2", "16:54", "Lời K-pop", "tone-c", "ko"),

    ("szI7AvSlr4E", "Hello Jadoo — Tôi là Choi Jadoo (song ngữ Hàn/Anh)", "Learn Korean with Jadoo", "Vỡ lòng", "10:09", "Hài · gia đình", "tone-d", "ko"),
    ("RIoQjLkijlM", "Hello Jadoo — Mẹ và bố (song ngữ Hàn/Anh)", "Hello Jadoo Việt Nam", "Vỡ lòng", "12:09", "Hài · gia đình", "tone-e", "ko"),
    ("3Jfv-LZojWE", "Hello Jadoo — Giấc mơ của Jadoo (song ngữ Hàn/Anh)", "Learn Korean with Jadoo", "TOPIK 1", "11:03", "Hài · gia đình", "tone-f", "ko"),
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

    ("o1VxetMgFOQ", "News Review — Nghiên cứu ADN cho cà phê ngon hơn", "BBC Learning English", "B2", "6:02", "Tin tức", "tone-e", "en"),
    ("SAOCMGiIcKM", "News Review — Giải marathon London vẫn diễn ra", "BBC Learning English", "B2", "10:57", "Tin tức", "tone-f", "en"),
    ("VsJduRJFwEQ", "Học từ vựng qua bản tin BBC", "JForrest English", "B2", "30:15", "Tin tức & từ vựng", "tone-a", "en"),
    ("JyZnolQsd04", "Học tiếng Anh với một bài báo BBC", "Learn English with Gill", "B2", "30:20", "Đọc tin tức", "tone-b", "en"),

    ("KwDJnXt3ZVQ", "Tim's Pronunciation Workshop — âm schwa /ə/", "BBC Learning English", "B1", "3:32", "Phát âm", "tone-c", "en"),
    ("mV_CEIroJs8", "Tim's Pronunciation Workshop — nối phụ âm với nguyên âm", "BBC Learning English", "B1", "3:06", "Nối âm", "tone-d", "en"),
    ("psI7E_J1zPo", "Tim's Pronunciation Workshop — dạng yếu của 'was' và 'were'", "BBC Learning English", "B1", "3:48", "Trọng âm", "tone-e", "en"),
    ("i_ohrkQmzdQ", "Tim's Pronunciation Workshop — đồng hoá âm /t/ và /p/", "BBC Learning English", "B2", "3:18", "Phát âm", "tone-f", "en"),
    ("DzCvN1dJP1Y", "Pronunciation — đồng hoá âm /t/ và /j/", "BBC Learning English", "B2", "3:58", "Phát âm", "tone-a", "en"),
    ("KJFC6ZgoPKo", "Mẹo phát âm hay hơn — tổng kết cả series", "BBC Learning English", "B1", "4:15", "Phát âm", "tone-b", "en"),

    ("q7jOwW5pe20", "English In A Minute — 4 cách dùng 'like'", "BBC Learning English", "A2", "0:43", "Ngữ pháp", "tone-c", "en"),
    ("W3d9SfPdS48", "English In A Minute — 5 cách dùng 'set'", "BBC Learning English", "B1", "1:02", "Ngữ pháp", "tone-d", "en"),
    ("MqjKOZSdG90", "BOX SET English In A Minute 1 — 10 bài ngữ pháp ngắn", "BBC Learning English", "A2", "9:47", "Ngữ pháp", "tone-e", "en"),
    ("d6J0OMjcQfc", "BOX SET English In A Minute 5 — 10 bài ngữ pháp ngắn", "BBC Learning English", "A2", "8:59", "Ngữ pháp", "tone-f", "en"),
    ("Dxq-SqReU0M", "BOX SET English In A Minute 13 — 10 bài ngữ pháp ngắn", "BBC Learning English", "B1", "9:45", "Ngữ pháp", "tone-a", "en"),
    ("LppAASWtUZU", "BOX SET English In A Minute 16 — 10 bài ngữ pháp ngắn", "BBC Learning English", "B1", "9:51", "Ngữ pháp", "tone-b", "en"),
    ("1e4VXrmtKNM", "BOX SET Trạng từ tiếng Anh — 8 bài ngữ pháp", "BBC Learning English", "B1", "27:23", "Trạng từ", "tone-c", "en"),
    ("gYq-ilAbxDM", "BOX SET 55 bài ngữ pháp & từ vựng trong 55 phút", "BBC Learning English", "B1", "55:18", "Ngữ pháp", "tone-d", "en"),

    ("gUhe6Rku500", "Planet Pop — bài hát về lớp học", "Planet Pop", "A1", "2:07", "Bài hát", "tone-e", "en"),
    ("uVXQfSzI9N0", "Planet Pop — bài hát về thể thao", "Planet Pop", "A1", "2:20", "Bài hát", "tone-f", "en"),
    ("ggkuCDrbHfI", "Planet Pop — bài hát về đồ dùng học tập", "Planet Pop", "A1", "2:30", "Bài hát", "tone-a", "en"),
    ("VPvLduIe_lI", "Planet Pop — bài hát hỏi về quốc tịch", "Planet Pop", "A1", "1:58", "Bài hát", "tone-b", "en"),
    ("168xwPpHF-s", "Planet Pop — bài hát về các phòng trong nhà", "Planet Pop", "A1", "2:12", "Bài hát", "tone-c", "en"),
    ("vjJuXqvFBD0", "Planet Pop — bài hát hỏi về sở thích", "Planet Pop", "A1", "2:56", "Bài hát", "tone-d", "en"),
    ("26gvR2GYMJ4", "Planet Pop — bài hát về các tháng trong năm", "Planet Pop", "A1", "2:42", "Bài hát", "tone-e", "en"),
    ("Xi8I9bi2Wp8", "Cách học tiếng Anh qua bài hát", "English Fluency Journey", "B1", "5:46", "Học qua nhạc", "tone-f", "en"),

    ("xN--gGkS8aU", "Tiểu phẩm hài — hiểu lầm vì ngôn ngữ", "Nick Michelioudakis", "B1", "1:37", "Hài", "tone-a", "en"),
    ("sAhcL-5guHA", "Tiểu phẩm hài — Bác sĩ có nhà không?", "Learn English With Dave", "A2", "2:51", "Hài", "tone-b", "en"),
    ("SgQ4HXP0eS8", "Tiểu phẩm hài — thành ngữ 'Made My Day'", "Learn English Idioms", "B1", "2:25", "Hài & thành ngữ", "tone-c", "en"),
    ("8Kb9tRoB6EI", "Thử tiếng Anh-Anh qua một tiểu phẩm hài", "Simple English Videos", "B2", "4:55", "Hài", "tone-d", "en"),
    ("ngcMOJT_zB0", "Tuyển tập tiểu phẩm hài học tiếng Anh", "Simple English Videos", "B1", "37:22", "Hài", "tone-e", "en"),
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
    ("wXB5Tjp6rmM", "Podcast nghe chậm và rõ", "Learn Chinese on the Go", "HSK 1–3", "27:23", "播客", "tone-e", "zh"),
    ("DfVnbCv8SjM", "15 hội thoại thật ở nhà hàng", "Say Mandarin 說中文", "HSK 1–2", "18:26", "餐厅", "tone-e", "zh"),
    ("PgvCz0fhEeg", "Hội thoại ở cửa hàng giày", "Say Mandarin 說中文", "HSK 1–2", "19:25", "鞋店对话", "tone-f", "zh"),
    ("1IjMdEz65mY", "Hội thoại ở tiệm trang sức", "Say Mandarin 說中文", "HSK 1–2", "19:21", "珠宝店对话", "tone-a", "zh"),
    ("WOZ5JCGH1bc", "Hội thoại ở hiệu sách", "Say Mandarin 說中文", "HSK 1–2", "22:13", "书店对话", "tone-b", "zh"),
    ("WR5QmxGsaA4", "Hội thoại ở hiệu thuốc", "Say Mandarin 說中文", "HSK 1–2", "20:25", "药店对话", "tone-c", "zh"),
    ("3xx_ur4e-9c", "15 hội thoại thật khi đi mua sắm", "Say Mandarin 說中文", "HSK 1–2", "24:00", "购物对话", "tone-d", "zh"),
    ("dligKDBMSUw", "15 hội thoại về hoa và cây cảnh", "Say Mandarin 說中文", "HSK 1–2", "22:18", "花卉对话", "tone-e", "zh"),
    ("qna81vhSdfY", "15 hội thoại với người lạ", "Say Mandarin 說中文", "HSK 1–2", "24:53", "陌生人对话", "tone-f", "zh"),
    ("_P9SIqzVZ0A", "Hội thoại buổi sáng mỗi ngày", "Say Mandarin 說中文", "HSK 1–2", "25:42", "早晨对话", "tone-a", "zh"),
    ("MvKiLS1PfLg", "Bí quyết sửa phát âm tiếng Trung", "Chinese Daily Podcast", "HSK 2–3", "14:07", "发音", "tone-b", "zh"),
    ("7jBC1ERfA08", "Hết nhầm 不 với 没, 能 với 可以", "Chinese Daily Podcast", "HSK 3–4", "17:26", "语法辨析", "tone-c", "zh"),
    ("8fr-6enY0ms", "Truyện trước giờ ngủ — về sự sẻ chia", "Chinese Daily Podcast", "HSK 2–3", "20:08", "睡前故事", "tone-d", "zh"),
    ("HsSxcmLyqx4", "Vì sao càng ít nói càng may mắn?", "Chinese Daily Podcast", "HSK 3–4", "18:22", "处世", "tone-e", "zh"),
    ("vhsPRlbzaac", "躺平 — buông xuôi hay tỉnh ngộ?", "Chinese Daily Podcast", "HSK 3–4", "12:47", "社会话题", "tone-f", "zh"),
    ("tDlWxZ1IqrQ", "Bốn trường phái ẩm thực lớn của Trung Quốc", "Chinese Daily Podcast", "HSK 2–3", "12:52", "四大菜系", "tone-a", "zh"),
    ("U2BFzltZWSo", "Văn hoá nướng đêm ở Trung Quốc", "Chinese Daily Podcast", "HSK 3–4", "15:18", "烧烤文化", "tone-b", "zh"),
    ("4KGh4HNyMJ8", "Tết Đoan Ngọ — sự tích và phong tục", "Chinese Daily Podcast", "HSK 3–4", "15:34", "端午节", "tone-c", "zh"),
    ("4N33a-_OpJw", "Vlog chậm — buổi sáng của tôi", "Jiayou Chinese", "HSK 1–3", "9:01", "早晨日常", "tone-d", "zh"),
    ("ive5H8hCBFs", "Vlog chậm — đi siêu thị mua đồ", "Jiayou Chinese", "HSK 1–3", "7:20", "超市", "tone-e", "zh"),
    ("qExvqTQag7o", "Vlog chậm — dọn nhà cùng tôi", "Jiayou Chinese", "HSK 1–3", "11:43", "家务", "tone-f", "zh"),
    ("9VXDx57gZY0", "Vlog chậm — nấu đậu phụ Tứ Xuyên", "Jiayou Chinese", "HSK 1–3", "10:48", "做饭", "tone-a", "zh"),
    ("mFb20gVBKI0", "Vlog chậm — dạo phố ngoại ô nước Đức", "Jiayou Chinese", "HSK 1–3", "9:40", "散步", "tone-b", "zh"),
    ("2DReT9aUIVE", "Vlog chậm — những ngày ở Paris", "Jiayou Chinese", "HSK 1–3", "8:32", "旅行", "tone-c", "zh"),
    ("dsqx3bazO0A", "Vlog chậm — du lịch Tunisia", "Jiayou Chinese", "HSK 1–3", "19:28", "旅行", "tone-d", "zh"),
    ("BDTP51K2vr4", "Học 2 năm mà nói gần như người bản xứ — cách nào?", "Jiayou Chinese", "HSK 2–3", "19:02", "学习方法", "tone-e", "zh"),
    ("b0cr38_Yo0k", "Vì sao chào hỏi của bạn nghe chưa tự nhiên", "Lala Chinese 啦啦的中文课", "HSK 1–2", "7:46", "打招呼", "tone-f", "zh"),
    ("T-4mIL1UIp8", "Học tiếng Trung qua một buổi đạp xe", "Lala Chinese 啦啦的中文课", "HSK 2–3", "14:13", "骑车", "tone-a", "zh"),
    ("WuUL_qHevGY", "Tiếng Trung tự nhiên cho ngày lười", "Lala Chinese 啦啦的中文课", "HSK 2–3", "14:16", "懒人日常", "tone-b", "zh"),
    ("95ufq4K0coQ", "Vlog — đừng tới Thượng Hải vào mùa này", "Lala Chinese 啦啦的中文课", "HSK 2–3", "11:24", "上海", "tone-c", "zh"),
    ("c1Pz6H6YLQQ", "Streettalk #3 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:43", "街头采访", "tone-d", "zh"),
    ("rhhLFw1PfT4", "Streettalk #5 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:40", "街头采访", "tone-e", "zh"),
    ("VDpnJoeoIrQ", "Streettalk #6 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:13", "街头采访", "tone-f", "zh"),
    ("XnXhcCF8tcc", "Streettalk #7 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "7:29", "街头采访", "tone-a", "zh"),
    ("KAICBWsW8XM", "Streettalk #8 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "5:09", "街头采访", "tone-b", "zh"),
    ("zPC5xVe3Yrk", "Streettalk #9 — tiếng Trung đường phố thật", "Better in Chinese", "HSK 3–4", "6:20", "街头采访", "tone-c", "zh"),
    ("7UDcz1eDz5s", "Hội thoại — kế hoạch giảm cân", "Better in Chinese", "HSK 2–3", "3:16", "健康对话", "tone-d", "zh"),
    ("WDkDAKj03Uw", "Podcast — xin thanh toán thế nào cho đúng", "Learn Chinese on the Go", "HSK 1–3", "21:50", "结账", "tone-e", "zh"),
    ("1z7oy6Q1M78", "Podcast — cách nhờ giúp đỡ", "Learn Chinese on the Go", "HSK 1–3", "21:59", "求助", "tone-f", "zh"),
    ("v64MxVVerl0", "Podcast — gọi đồ uống ở Trung Quốc", "Learn Chinese on the Go", "HSK 1–3", "21:59", "点饮料", "tone-a", "zh"),
    ("x9t9Mk2zV64", "Podcast — nói gì khi đi mua sắm", "Learn Chinese on the Go", "HSK 1–3", "21:34", "购物表达", "tone-b", "zh"),
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
