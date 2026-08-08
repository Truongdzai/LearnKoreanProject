import { useCallback, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import AiSpeaking from './AiSpeaking'
import RoomsPanel from './RoomsPanel'

type Mode = 'ai' | 'room'

function readInvite() {
  const q = new URLSearchParams(window.location.search)
  return { room: (q.get('phong') || '').toUpperCase(), invite: q.get('moi') || '' }
}

export default function SpeakingPage() {
  const { t, learnLangName } = useAppStore()
  const [link] = useState(readInvite)
  const [mode, setMode] = useState<Mode>(link.room ? 'room' : 'ai')

  const clearLink = useCallback(() => {
    const url = window.location.pathname
    if (window.location.search) window.history.replaceState({}, '', url)
  }, [])

  return (
    <div className="speaking">
      <header className="sp-hero">
        <div className="sp-hero-text">
          <h1 className="page-title"><Icon name="mic" /> {t('sp.title')}</h1>
          <p className="page-sub">{t(mode === 'ai' ? 'sp.sub' : 'room.sub', { lang: learnLangName })}</p>
        </div>
        <div className="sp-modes" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'ai'}
            className={'sp-mode' + (mode === 'ai' ? ' on' : '')}
            onClick={() => setMode('ai')}
          >
            <span className="sp-mode-emoji">🤖</span>
            <span>
              <b>{t('sp.modeAi')}</b>
              <small>{t('sp.modeAiDesc')}</small>
            </span>
          </button>
          <button
            role="tab"
            aria-selected={mode === 'room'}
            className={'sp-mode' + (mode === 'room' ? ' on' : '')}
            onClick={() => setMode('room')}
          >
            <span className="sp-mode-emoji">🎧</span>
            <span>
              <b>{t('sp.modeRoom')}</b>
              <small>{t('sp.modeRoomDesc')}</small>
            </span>
          </button>
        </div>
      </header>

      {mode === 'ai' ? (
        <AiSpeaking />
      ) : (
        <RoomsPanel initialRoom={link.room} initialInvite={link.invite} onConsumeInvite={clearLink} />
      )}
    </div>
  )
}
