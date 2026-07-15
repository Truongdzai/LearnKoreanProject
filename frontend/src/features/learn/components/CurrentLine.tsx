import { romanizeLine } from '@/core/utils/romanize'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Segment } from '@/models/lesson.model'

export default function CurrentLine({ segment }: { segment?: Segment }) {
  const { learnLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  return (
    <div className="cur-line">
      {segment && cfg.romanizeChat && <div className="ph">{romanizeLine(segment.ko)}</div>}
      <div className="ko" lang={learnLang}>{segment ? segment.ko : '—'}</div>
      <div className="vi">{segment?.vi || t('learn.clickLine')}</div>
    </div>
  )
}
