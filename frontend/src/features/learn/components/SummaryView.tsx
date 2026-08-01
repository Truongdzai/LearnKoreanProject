import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Lesson } from '@/models/lesson.model'
import { isNoSpaceLang, words } from '@/core/segment'

const KO_STOP = new Set(['저는', '오늘', '정말', '또'])
const CJK_STOP = new Set(['的', '了', '是', '在', '和', '就', '也', '很', '不', '我', '你', '他',
  'です', 'ます', 'した', 'する', 'して', 'こと', 'これ', 'それ'])

function keywords(lesson: Lesson, lang: string): string[] {
  const cjk = isNoSpaceLang(lang)
  const stop = cjk ? CJK_STOP : KO_STOP
  const seen = new Set<string>()
  const out: string[] = []
  for (const seg of lesson.segments) {
    for (let w of words(seg.ko, lang)) {
      if (!cjk) w = w.replace(/[.,!?]/g, '')
      if (lang === 'ko') w = w.replace(/(을|를|이|가|은|는|에서|에게|에|와|과|도)$/u, '')
      if (w.length >= 2 && !/^\d+$/.test(w) && !stop.has(w) && !seen.has(w)) {
        seen.add(w)
        out.push(w)
      }
      if (out.length >= 10) return out
    }
  }
  return out
}

const GRAMMAR = [
  { p: '–아요/어요', d: 'sm.g1', ex: 'sm.g1ex' },
  { p: '–았어요/었어요', d: 'sm.g2', ex: 'sm.g2ex' },
  { p: '에서', d: 'sm.g3', ex: 'sm.g3ex' },
  { p: '을/를', d: 'sm.g4', ex: 'sm.g4ex' },
]

export default function SummaryView({ lesson }: { lesson: Lesson }) {
  const { openLookup, learnLang, t } = useAppStore()
  const keys = keywords(lesson, learnLang)
  const phrases = lesson.segments.slice(0, 5)

  return (
    <div className="summary">
      <div className="sm-ai-tag"><Icon name="sparkles" size={14} /> {t('sm.aiTag')}</div>

      <div className="sm-grid">
        <div className="sm-card span2">
          <div className="sm-label"><Icon name="bulb" size={15} /> {t('sm.overview')}</div>
          <p>{t('sm.overviewText', { title: lesson.title, n: lesson.segments.length })}</p>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="note" size={15} /> {t('sm.info')}</div>
          <ul className="sm-info">
            <li><span>{t('sm.goal')}</span><b>{t('sm.goalV')}</b></li>
            <li><span>{t('sm.audience')}</span><b>{t('sm.audienceV')}</b></li>
            <li><span>{t('sm.lines')}</span><b>{t('sm.linesV', { n: lesson.segments.length })}</b></li>
            <li><span>{t('sm.concepts')}</span><b>{t('sm.conceptsV', { n: Math.max(3, Math.round(lesson.segments.length / 2)) })}</b></li>
          </ul>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="cards" size={15} /> {t('sm.vocab')}</div>
          <p className="sm-sub">{t('sm.vocabSub')}</p>
          <div className="sm-words">
            {keys.map((w) => (
              <button key={w} lang={learnLang} onClick={() => openLookup(w)}>{w}</button>
            ))}
          </div>
        </div>

        {learnLang === 'ko' && (
          <div className="sm-card">
            <div className="sm-label"><Icon name="letters" size={15} /> {t('sm.grammar')}</div>
            <ul className="sm-grammar">
              {GRAMMAR.map((g) => (
                <li key={g.p}><b lang="ko">{g.p}</b><span>{t(g.d)}</span><em lang="ko">{t(g.ex)}</em></li>
              ))}
            </ul>
          </div>
        )}

        <div className="sm-card">
          <div className="sm-label"><Icon name="volume" size={15} /> {t('sm.phrases')}</div>
          <ul className="sm-phrases">
            {phrases.map((s, i) => (
              <li key={i}><span lang={learnLang}>{s.ko}</span><em>{s.vi}</em></li>
            ))}
          </ul>
        </div>

        <div className="sm-card span2 sm-practice">
          <div className="sm-label"><Icon name="target" size={15} /> {t('sm.practice')}</div>
          <ul>
            <li><Icon name="check-circle" size={15} /> {t('sm.p1')}</li>
            <li><Icon name="check-circle" size={15} /> {t('sm.p2')}</li>
            <li><Icon name="check-circle" size={15} /> {t('sm.p3')}</li>
            <li><Icon name="check-circle" size={15} /> {t('sm.p4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
