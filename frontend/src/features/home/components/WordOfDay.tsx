import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { wordOfDay } from '@/data/wordOfDay'

export default function WordOfDay() {
  const { learnLang, openLookup, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const w = wordOfDay(learnLang)

  const speak = () => speakLang(w.term, cfg.locale, 0.9)

  return (
    <div className="wod">
      <div className="wod-term">
        <b className="wod-field">{t('wod.title')}</b>
        <span className="wod-word-wrap">
          <span className="wod-word">{w.term}</span>
          <button className="wod-speak" onClick={speak} title={t('wod.listen')}><Icon name="volume" size={16} /></button>
        </span>
        <span className="wod-lang">{learnLangName}</span>
      </div>
      <div className="wod-sub">{w.sub}</div>
      <div className="wod-vi">{w.vi}</div>
      <div className="wod-ex">
        <p>{w.ex}</p>
        <small>{w.exVi}</small>
      </div>
      <button className="btn-ghost sm" onClick={() => openLookup(w.term)}>
        <Icon name="search" size={14} /> {t('wod.deep')}
      </button>
    </div>
  )
}
