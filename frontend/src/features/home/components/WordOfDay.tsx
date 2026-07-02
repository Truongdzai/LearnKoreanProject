import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { wordOfDay } from '@/data/wordOfDay'

export default function WordOfDay() {
  const { learnLang, openLookup, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const w = wordOfDay(learnLang)

  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(w.term)
      u.lang = cfg.locale
      u.rate = 0.9
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch { /* trình duyệt không hỗ trợ TTS */ }
  }

  return (
    <div className="wod">
      <div className="wod-head">
        <b>📖 {t('wod.title')}</b>
        <span className="wod-lang">{learnLangName}</span>
      </div>
      <div className="wod-term">
        <span className="wod-word">{w.term}</span>
        <button className="wod-speak" onClick={speak} title={t('wod.listen')}><Icon name="volume" size={16} /></button>
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
