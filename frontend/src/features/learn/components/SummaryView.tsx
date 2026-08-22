import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Lesson } from '@/models/lesson.model'
import { clockLabel, lessonFacts, notableWords, usefulPhrases } from '@/core/utils/summary'

const GRAMMAR = [
  { p: '–아요/어요', d: 'sm.g1', ex: 'sm.g1ex' },
  { p: '–았어요/었어요', d: 'sm.g2', ex: 'sm.g2ex' },
  { p: '에서', d: 'sm.g3', ex: 'sm.g3ex' },
  { p: '을/를', d: 'sm.g4', ex: 'sm.g4ex' },
]

export default function SummaryView({ lesson }: { lesson: Lesson }) {
  const { openLookup, learnLang, t } = useAppStore()
  const facts = lessonFacts(lesson, learnLang)
  const keys = notableWords(lesson, learnLang)
  const phrases = usefulPhrases(lesson, learnLang)

  return (
    <div className="summary">
      <div className="sm-ai-tag"><Icon name="sparkles" size={14} /> {t('sm.aiTag')}</div>

      <div className="sm-grid">
        <div className="sm-card span2">
          <div className="sm-label"><Icon name="bulb" size={15} /> {t('sm.overview')}</div>
          <p>{t('sm.overviewText', {
            title: lesson.title,
            n: facts.spokenLines,
            dur: clockLabel(facts.seconds),
            wpm: facts.wpm,
          })}</p>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="note" size={15} /> {t('sm.info')}</div>
          <ul className="sm-info">
            <li><span>{t('sm.duration')}</span><b>{clockLabel(facts.seconds)}</b></li>
            <li><span>{t('sm.lines')}</span><b>{t('sm.linesV', { n: facts.spokenLines })}</b></li>
            {facts.noiseLines > 0 && (
              <li><span>{t('sm.noise')}</span><b>{t('sm.noiseV', { n: facts.noiseLines })}</b></li>
            )}
            <li><span>{t('sm.uniqueWords')}</span><b>{t('sm.uniqueWordsV', { n: facts.uniqueWords })}</b></li>
            <li><span>{t('sm.pace')}</span><b>{t('sm.paceV', { n: facts.wpm })}</b></li>
          </ul>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="cards" size={15} /> {t('sm.vocab')}</div>
          <p className="sm-sub">{t('sm.vocabSub')}</p>
          <div className="sm-words">
            {keys.map((k) => (
              <button key={k.word} lang={learnLang} onClick={() => openLookup(k.word)}>
                {k.word}
                {k.count > 1 && <em className="sm-count">{k.count}</em>}
              </button>
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
            {phrases.map((p) => (
              <li key={p.text}>
                <span lang={learnLang}>{p.text}</span>
                {p.count > 1 && <b className="sm-rep">{t('sm.repeat', { n: p.count })}</b>}
                <em>{p.vi}</em>
              </li>
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
