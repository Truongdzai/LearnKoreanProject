import { useMemo } from 'react'
import Icon from '@/core/components/Icon'
import { posLabel } from '@/data/vocabCore'
import { studyLang } from '@/core/constants/languages'
import { usePhonetics } from '@/hooks/usePhonetics'
import AudioBtn from './AudioBtn'
import WordImg from '../WordImg'
import SoundCheck from './SoundCheck'
import type { ModeProps } from './types'

export default function Repeat({ card, lang, accents, speak, onNext }: ModeProps) {
  const { w, term } = card
  const locale = studyLang(lang).locale
  const lines = useMemo(() => [term, w.ex], [term, w.ex])
  const ph = usePhonetics(lang, lines)

  return (
    <div className="vl-card-wrap">
      <div className="vl-card wide">
        <div className="vl-repeat-head">
          <WordImg term={term} emoji={w.img} className="vl-img sm" />
          <div>
            <div className="vl-term-row">
              <h3 lang={lang}>{term}</h3>
              <span className="vl-pos">{posLabel(w.pos)}</span>
            </div>
            <div className="vl-ipa-row">
              {accents ? (
                <>
                  <AudioBtn text={term} accent="us" ipa={card.us} compact />
                  <AudioBtn text={term} accent="uk" ipa={card.uk} compact />
                </>
              ) : (
                <button className="vl-mini" onClick={() => speak(term)}>
                  <Icon name="volume" size={13} /> {card.read}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="vl-block">
          <h4>MẸO NHỚ</h4>
          <p>{w.connect}</p>
        </div>

        <div className="vl-block">
          <h4>BẢN DỊCH</h4>
          <p className="vl-mean">{w.vi}</p>
        </div>

        <h4 className="vl-section">LUYỆN NÓI — MÁY CHẤM TỪNG ÂM</h4>
        <SoundCheck label="TỪ" text={term} lang={lang} locale={locale} accents={accents} speak={speak} ph={ph} />
        <SoundCheck label="VÍ DỤ" text={w.ex} lang={lang} locale={locale} accents={accents} speak={speak} ph={ph} />

        <div className="vl-guess-actions">
          <button className="vl-btn ok" onClick={onNext}>
            Thẻ tiếp theo <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
