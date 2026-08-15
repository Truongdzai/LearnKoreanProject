from __future__ import annotations

TOPICS = (
    "beginner", "daily", "story", "kids", "music", "movie", "comedy", "news", "podcast",
    "travel", "food", "science", "culture", "work", "slow", "pronounce",
    "grammar", "vocab", "exam",
)

_CHANNEL_RULES = {
    "bbc learning": ("daily", "vocab"),
    "voa learning": ("slow", "vocab"),
    "ted": ("science",),
    "british council": ("kids", "story"),
    "little fox": ("kids", "story"),
    "immersion": ("story", "slow"),
    "몰입": ("story", "slow"),
    "easy ": ("daily",),
    "talk to me in korean": ("daily",),
}

_TITLE_RULES = {
    "beginner": ("người mới", "vỡ lòng", "cho người mới", "số 0", "a0", "cơ bản", "nhập môn", "beginner"),
    "daily": ("hội thoại", "giao tiếp", "hằng ngày", "hàng ngày", "đời thường", "trò chuyện", "대화", "conversation"),
    "story": ("truyện", "câu chuyện", "kể chuyện", "cổ tích", "이야기", "story", "tale"),
    "kids": ("thiếu nhi", "trẻ em", "cho bé", "kids"),
    "music": ("nhạc", "bài hát", "ca khúc", "lời bài hát", "song", "music"),
    "movie": ("phim", "trích đoạn", "trailer", "hoạt hình", "movie", "drama"),
    "comedy": ("hài", "gây cười", "vui nhộn", "tiểu phẩm", "comedy", "funny", "sketch", "sitcom", "개그", "코미디"),
    "news": ("tin tức", "thời sự", "bản tin", "news"),
    "podcast": ("podcast", "radio"),
    "travel": ("du lịch", "sân bay", "khách sạn", "hỏi đường", "여행", "travel"),
    "food": ("ẩm thực", "món ăn", "đồ ăn", "gọi món", "nhà hàng", "quán ăn", "음식", "food"),
    "science": ("khoa học", "vũ trụ", "cơ thể", "động vật", "thiên nhiên", "science"),
    "culture": ("văn hoá", "văn hóa", "lễ hội", "phong tục", "đời sống", "culture"),
    "work": ("công việc", "phỏng vấn", "văn phòng", "họp", "kinh doanh", "business", "job", "work"),
    "slow": ("nghe chậm", "chậm", "slow", "천천히"),
    "pronounce": ("phát âm", "trọng âm", "ngữ điệu", "nối âm", "발음", "pronunciation", "ipa", "phonetic"),
    "grammar": ("ngữ pháp", "mẫu câu", "cấu trúc", "문법", "grammar"),
    "vocab": ("từ vựng", "100 câu", "100문장", "cụm từ", "단어", "vocabulary", "phrase", "idiom"),
    "exam": ("topik", "toeic", "ielts", "toefl", "hsk", "jlpt", "goethe", "luyện thi", "đề thi"),
}

_LEVEL_HINTS = ("topik", "toeic", "ielts", "hsk", "jlpt", "goethe")

TAG_OVERRIDES = {
    "aN78Tz_e5c4": ("movie", "comedy", "kids"),
    "sN_vqwoC53Q": ("movie", "comedy", "kids"),
    "EzZ5Abh8xTM": ("movie", "comedy", "food"),
    "xfc1j4rpw0c": ("movie", "comedy", "kids"),
    "Oaha-hNJT4E": ("movie", "comedy", "story"),
    "RfciUa586VI": ("movie", "comedy", "kids"),
    "ZTFnT7IzdBQ": ("movie", "comedy", "food"),
    "4474zOLzD8k": ("movie", "comedy", "story"),
    "Khtdwww58h4": ("movie", "comedy", "daily"),
    "u50iAtNCMQc": ("movie", "comedy", "daily"),
    "iqoEGCxJy3g": ("movie", "comedy", "story"),
    "WQO5wXCGNW8": ("movie", "comedy", "kids"),
    "C5kR-exHmr4": ("movie", "story", "kids"),
    "EUZnjEEh2DU": ("movie", "comedy", "story"),
    "8-gyMEyeC54": ("movie", "comedy", "kids"),
    "sGAqzZFuewg": ("pronounce", "beginner"),
    "sx0yyQqkpqo": ("grammar", "beginner"),
    "U49SJ-evntU": ("grammar", "beginner"),
    "YzpwHrA_iQQ": ("grammar", "beginner"),
    "Cxu3ZB2QtWU": ("grammar",),
    "GfG_BCx35rQ": ("grammar", "beginner"),
    "8KqrxZgr30E": ("news",),
    "FPohS5GUM7U": ("news",),
    "-_eW0dui684": ("music", "kids", "beginner"),
    "woQrHL4Gq10": ("music", "kids", "culture"),
    "cgVGY3ErU1I": ("music",),
    "mHl_fTOO3qE": ("music",),
    "MYQrQvbR8Vk": ("daily", "beginner", "podcast"),
    "97NV2txklwk": ("culture", "daily"),
    "4N33a-_OpJw": ("slow", "daily", "beginner"),
    "ive5H8hCBFs": ("slow", "daily", "beginner"),
    "mFb20gVBKI0": ("slow", "travel"),
    "2DReT9aUIVE": ("slow", "travel"),
    "b0cr38_Yo0k": ("daily", "pronounce", "beginner"),
    "c1Pz6H6YLQQ": ("culture", "daily"),
    "rhhLFw1PfT4": ("culture", "daily"),
    "VDpnJoeoIrQ": ("culture", "daily"),
    "XnXhcCF8tcc": ("culture", "daily"),
    "KAICBWsW8XM": ("culture", "daily"),
    "zPC5xVe3Yrk": ("culture", "daily"),
    "7UDcz1eDz5s": ("daily", "story"),
    "xBuYvX5kJl0": ("slow", "daily", "beginner"),
    "lYEfvaZeamI": ("slow", "daily", "beginner"),
    "Och9p-WqPTg": ("slow", "daily", "beginner"),
    "j5E1jIft05c": ("slow", "daily", "beginner"),
    "tkhYt-EAjls": ("slow", "food", "beginner"),
    "uLjRKxEYeA0": ("slow", "daily", "beginner"),
    "VXMm-HBVa14": ("slow", "daily", "beginner"),
    "WzArpPGLghw": ("slow", "daily", "beginner"),
    "Q7_UmOUi1XE": ("slow", "food", "beginner"),
    "ddDyB0MGxJs": ("slow", "daily", "beginner"),
    "ewL6SaZzjyU": ("slow", "daily", "beginner"),
    "dpzJkC7hptY": ("slow", "travel", "beginner"),
    "eXgzit1jiwI": ("slow", "travel", "beginner"),
    "kubL3OtqpME": ("podcast", "slow", "beginner"),
    "Qf6dN4n0d6s": ("podcast", "daily"),
    "aczPsLhpDRE": ("culture", "slow"),
    "zcZIkpMBs14": ("culture", "slow"),
    "fXdYSlTMZxo": ("culture", "slow"),
    "TfoThmNj_rM": ("vocab", "slow"),
    "ooQNETO4dK0": ("daily", "slow"),
    "fTlCyr_nh7g": ("travel", "daily", "beginner"),
    "XMoazr8vaxA": ("culture", "vocab"),
    "8jv9LMi45lY": ("culture", "daily"),
    "YVvJL3ib_HY": ("food", "travel"),
    "wDa4lQVGl1U": ("daily", "travel"),
    "r0yawVo9KCo": ("slow", "daily"),
    "bKwHWyND8pY": ("slow", "daily"),
}


def _match(haystack: str, needles) -> bool:
    return any(n in haystack for n in needles)


def tags_for(vid: str, title: str, channel: str, topic: str, level: str) -> list[str]:
    fixed = TAG_OVERRIDES.get(vid)
    if fixed:
        return [t for t in fixed if t in TOPICS]
    text = " ".join((title or "", topic or "")).lower()
    chan = (channel or "").lower()
    lvl = (level or "").lower()
    found: list[str] = []

    for key, tags in _CHANNEL_RULES.items():
        if key in chan:
            found.extend(tags)

    for tag, needles in _TITLE_RULES.items():
        if _match(text, needles):
            found.append(tag)

    if _match(lvl, _LEVEL_HINTS) and "1" not in lvl and "2" not in lvl:
        found.append("exam")
    if _match(lvl, ("vỡ lòng", "a0", "a1", "topik 1", "hsk 1", "n5")):
        found.append("beginner")

    seen: list[str] = []
    for tag in found:
        if tag in TOPICS and tag not in seen:
            seen.append(tag)
    return seen or ["daily"]


def encode(tags) -> str:
    return ",".join(t for t in tags if t in TOPICS)


def decode(raw: str | None) -> list[str]:
    return [t for t in (raw or "").split(",") if t in TOPICS]
