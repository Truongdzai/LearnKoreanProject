import { useEffect, useState } from 'react'
import { fetchProgressApi, type LangProgress } from '@/core/api/me.api'
import Icon from '@/core/components/Icon'
import Flag from '@/core/components/Flag'
import { studyLangName } from '@/core/i18n/translations'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const DAYS = 30

export default function LangProgressCards() {
  const { t, uiLang, learnLang, setLearnLang, setView } = useAppStore()
  const { isAuthed } = useAuth()
  const [langs, setLangs] = useState<LangProgress[] | null>(null)

  useEffect(() => {
    if (!isAuthed) { setLangs([]); return }
    fetchProgressApi(DAYS)
      .then((r) => setLangs(r.langs))
      .catch(() => setLangs([]))
  }, [isAuthed])

  if (!isAuthed || !langs || !langs.length) return null

  const open = (code: string) => {
    setLearnLang(code)
    setView('activities')
  }

  return (
    <>
      <div className="section-title"><span className="pin" /> {t('dash.byLang', { n: DAYS })}</div>
      <div className="lang-prog-grid">
        {langs.map((l) => (
          <button
            key={l.lang}
            type="button"
            className={'lang-prog' + (l.lang === learnLang ? ' on' : '')}
            onClick={() => open(l.lang)}
          >
            <div className="lp-head">
              <Flag code={l.lang} size={24} />
              <b>{studyLangName(uiLang, l.lang)}</b>
              {l.lang === learnLang && <span className="lp-now">{t('dash.studying')}</span>}
            </div>
            <div className="lp-rows">
              <span><Icon name="clock" size={13} /> {t('dash.minutes', { n: l.minutes })}</span>
              <span><Icon name="star" size={13} /> {t('dash.xp', { n: l.xp })}</span>
              <span><Icon name="cards" size={13} /> {t('dash.cards', { a: l.cards.total, b: l.cards.due })}</span>
              <span><Icon name="flame" size={13} /> {t('dash.activeDays', { n: l.activeDays })}</span>
            </div>
            {l.cards.due > 0 && (
              <div className="lp-due">{t('dash.dueNow', { n: l.cards.due })}</div>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
