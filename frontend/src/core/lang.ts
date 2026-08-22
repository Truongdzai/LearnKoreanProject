import { AVAILABLE_STUDY_LANGS } from '@/core/constants/languages'

export const LEARN_LANG_KEY = 'vyling.learnLang'

export function fallbackLang(): string {
  return AVAILABLE_STUDY_LANGS[0]?.code || 'en'
}

export function getLearnLang(): string {
  const fallback = fallbackLang()
  try {
    const saved = localStorage.getItem(LEARN_LANG_KEY) || fallback
    return AVAILABLE_STUDY_LANGS.some((l) => l.code === saved) ? saved : fallback
  } catch {
    return fallback
  }
}
