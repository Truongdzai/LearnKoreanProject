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
    "o1VxetMgFOQ": ("news", "vocab"),
    "SAOCMGiIcKM": ("news", "vocab"),
    "VsJduRJFwEQ": ("news", "vocab"),
    "JyZnolQsd04": ("news", "vocab"),
    "KwDJnXt3ZVQ": ("pronounce",),
    "mV_CEIroJs8": ("pronounce",),
    "i_ohrkQmzdQ": ("pronounce",),
    "DzCvN1dJP1Y": ("pronounce",),
    "psI7E_J1zPo": ("pronounce",),
    "KJFC6ZgoPKo": ("pronounce",),
    "MqjKOZSdG90": ("grammar", "vocab"),
    "d6J0OMjcQfc": ("grammar", "vocab"),
    "Dxq-SqReU0M": ("grammar", "vocab"),
    "LppAASWtUZU": ("grammar", "vocab"),
    "q7jOwW5pe20": ("grammar",),
    "W3d9SfPdS48": ("grammar",),
    "1e4VXrmtKNM": ("grammar",),
    "gYq-ilAbxDM": ("grammar", "vocab"),
    "gUhe6Rku500": ("music", "kids", "beginner"),
    "uVXQfSzI9N0": ("music", "kids", "beginner"),
    "ggkuCDrbHfI": ("music", "kids", "beginner"),
    "VPvLduIe_lI": ("music", "kids", "beginner"),
    "168xwPpHF-s": ("music", "kids", "beginner"),
    "vjJuXqvFBD0": ("music", "kids", "beginner"),
    "26gvR2GYMJ4": ("music", "kids", "beginner"),
    "Xi8I9bi2Wp8": ("music",),
    "oI9wswL_i5c": ("pronounce", "beginner"),
    "r8MemnlRTbs": ("pronounce",),
    "sGAqzZFuewg": ("pronounce", "beginner"),
    "sx0yyQqkpqo": ("grammar", "beginner"),
    "U49SJ-evntU": ("grammar", "beginner"),
    "YzpwHrA_iQQ": ("grammar", "beginner"),
    "k3j8rzA9rA4": ("grammar",),
    "Cxu3ZB2QtWU": ("grammar",),
    "GfG_BCx35rQ": ("grammar", "beginner"),
    "8KqrxZgr30E": ("news",),
    "FPohS5GUM7U": ("news",),
    "-_eW0dui684": ("music", "kids", "beginner"),
    "woQrHL4Gq10": ("music", "kids", "culture"),
    "WqIw2W2nEzU": ("music", "kids", "beginner"),
    "cgVGY3ErU1I": ("music",),
    "cNlhoyoe_os": ("music", "vocab"),
    "mHl_fTOO3qE": ("music",),
    "xN--gGkS8aU": ("comedy", "vocab"),
    "sAhcL-5guHA": ("comedy", "daily", "beginner"),
    "SgQ4HXP0eS8": ("comedy", "vocab"),
    "8Kb9tRoB6EI": ("comedy", "vocab", "culture"),
    "ngcMOJT_zB0": ("comedy", "daily"),
    "szI7AvSlr4E": ("comedy", "story", "beginner"),
    "RIoQjLkijlM": ("comedy", "story", "beginner"),
    "3Jfv-LZojWE": ("comedy", "story", "beginner"),
    "rwnyaH6cTDE": ("food", "daily", "beginner"),
    "MYQrQvbR8Vk": ("daily", "beginner", "podcast"),
    "DVRy3l9ojq4": ("podcast", "daily"),
    "oLHfnK9IVZs": ("slow", "food", "beginner"),
    "LcUoiBwG-OA": ("food", "travel", "culture"),
    "97NV2txklwk": ("culture", "daily"),
    "wXB5Tjp6rmM": ("podcast", "slow"),
    "DfVnbCv8SjM": ("food", "daily", "beginner"),
    "PgvCz0fhEeg": ("daily", "vocab", "beginner"),
    "1IjMdEz65mY": ("daily", "vocab", "beginner"),
    "WOZ5JCGH1bc": ("daily", "vocab", "beginner"),
    "WR5QmxGsaA4": ("daily", "vocab", "beginner"),
    "3xx_ur4e-9c": ("daily", "vocab", "beginner"),
    "dligKDBMSUw": ("daily", "vocab", "beginner"),
    "qna81vhSdfY": ("daily", "beginner"),
    "_P9SIqzVZ0A": ("daily", "beginner"),
    "MvKiLS1PfLg": ("pronounce", "podcast"),
    "7jBC1ERfA08": ("grammar", "podcast"),
    "8fr-6enY0ms": ("story", "podcast", "slow"),
    "HsSxcmLyqx4": ("podcast", "culture"),
    "vhsPRlbzaac": ("podcast", "culture"),
    "tDlWxZ1IqrQ": ("food", "culture", "podcast"),
    "U2BFzltZWSo": ("food", "culture", "podcast"),
    "4KGh4HNyMJ8": ("culture", "podcast"),
    "4N33a-_OpJw": ("slow", "daily", "beginner"),
    "ive5H8hCBFs": ("slow", "daily", "beginner"),
    "qExvqTQag7o": ("slow", "daily", "beginner"),
    "9VXDx57gZY0": ("slow", "food"),
    "mFb20gVBKI0": ("slow", "travel"),
    "2DReT9aUIVE": ("slow", "travel"),
    "dsqx3bazO0A": ("slow", "travel"),
    "BDTP51K2vr4": ("slow", "culture"),
    "b0cr38_Yo0k": ("daily", "pronounce", "beginner"),
    "T-4mIL1UIp8": ("slow", "daily"),
    "WuUL_qHevGY": ("daily", "slow"),
    "95ufq4K0coQ": ("travel", "culture"),
    "c1Pz6H6YLQQ": ("culture", "daily"),
    "rhhLFw1PfT4": ("culture", "daily"),
    "VDpnJoeoIrQ": ("culture", "daily"),
    "XnXhcCF8tcc": ("culture", "daily"),
    "KAICBWsW8XM": ("culture", "daily"),
    "zPC5xVe3Yrk": ("culture", "daily"),
    "7UDcz1eDz5s": ("daily", "story"),
    "WDkDAKj03Uw": ("podcast", "daily", "beginner"),
    "1z7oy6Q1M78": ("podcast", "daily", "beginner"),
    "v64MxVVerl0": ("podcast", "food", "beginner"),
    "x9t9Mk2zV64": ("podcast", "daily", "beginner"),
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
