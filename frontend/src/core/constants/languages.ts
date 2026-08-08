export interface StudyLang {
  code: string
  name: string
  endonym: string
  flag: string
  locale: string
  reading: 'romaja' | 'pinyin' | null
  sample: string[]
}

export const STUDY_LANGS: StudyLang[] = [
  {
    code: 'ja', name: 'Tiếng Nhật', endonym: '日本語', flag: 'jp', locale: 'ja-JP',
    reading: null, sample: ['こんにちは', 'ありがとう', '美味しい', '大丈夫', '頑張る', '幸せ'],
  },
  {
    code: 'en', name: 'Tiếng Anh', endonym: 'English', flag: 'us', locale: 'en-US',
    reading: null, sample: ['hello', 'beautiful', 'improve', 'schedule', 'though', 'awesome'],
  },
  {
    code: 'zh', name: 'Tiếng Trung', endonym: '中文', flag: 'cn', locale: 'zh-CN',
    reading: 'pinyin', sample: ['你好', '谢谢', '漂亮', '加油', '喜欢', '幸福'],
  },
  {
    code: 'ko', name: 'Tiếng Hàn', endonym: '한국어', flag: 'kr', locale: 'ko-KR',
    reading: 'romaja', sample: ['안녕하세요', '감사합니다', '사랑', '맛있다', '행복', '괜찮아요'],
  },
]

const DEFAULT_STUDY = STUDY_LANGS.find((l) => l.code === 'ko') as StudyLang

export function studyLang(code: string): StudyLang {
  return STUDY_LANGS.find((l) => l.code === code) || DEFAULT_STUDY
}

export interface NativeLang {
  code: string
  name: string
  flag: string
}

export const NATIVE_LANGS: NativeLang[] = [
  { code: 'vi', name: 'Vietnamese', flag: 'vn' },
]

export const NATIVE_CODE = 'vi'

export function nativeLangViName(_code?: string): string {
  return 'tiếng Việt'
}

export function nativeLang(code: string): NativeLang {
  return NATIVE_LANGS.find((l) => l.code === code) || NATIVE_LANGS[0]
}
