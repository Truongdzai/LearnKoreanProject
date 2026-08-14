import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import { FAMILIES, FAMILY_GLOSS, LEVELS, comboCount, wordEntry } from '@/data/englishActive'
import { MasteryProvider, useMastery } from '@/features/english/active/mastery'

const BAR_TONE = ['b1', 'b2', 'b3', 'b4', 'b5']

function jumpToWord(head: string): void {
  try {
    sessionStorage.setItem('vyling.en.jump', JSON.stringify({ tab: 'word', word: head }))
  } catch {  }
}

function Card() {
  const { setView, t } = useAppStore()
  const { familyMastery, recOf } = useMastery()
  const [flipped, setFlipped] = useState(false)

  const family = useMemo(() => {
    const scored = FAMILIES.map((f) => {
      const m = familyMastery(f.members)
      return { f, m }
    })
    const inProgress = scored.filter((s) => s.m.touched > 0 && s.m.pct[4] < 100)
    const pick = inProgress.sort((a, b) => b.m.touched - a.m.touched)[0] ?? scored[0]
    return pick
  }, [familyMastery])

  const { f, m } = family
  const gloss = FAMILY_GLOSS[f.head]

  const chips = useMemo(
    () => f.members.filter((c) => c.en.toLowerCase().startsWith(f.head)).slice(0, 8),
    [f],
  )

  const entry = wordEntry(f.head)

  const fallback = useMemo(() => {
    const seen = new Set<string>()
    return f.members
      .filter((c) => {
        const key = c.vi.split(';')[0].trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 7)
  }, [f])

  const open = () => {
    jumpToWord(f.head)
    setView('english')
  }

  const nextLevel = LEVELS.slice(1).find((l) => m.pct[l.lv - 1] < 100)

  return (
    <>
      <div className="section-title">
        <span className="pin" /> {t('mw.title')}
        <button className="link-more" onClick={() => { jumpToWord(''); setView('english') }}>
          {t('home.viewAll')} <Icon name="arrow-right" size={15} />
        </button>
      </div>

      <div className="mw">
        <div className={'mw-flip' + (flipped ? ' on' : '')}>
          <div className="mw-face front" aria-hidden={flipped}>
            <span className="mw-kicker">{t('mw.learning')}</span>
            <div className="mw-word">
              <b>{f.head}</b>
              <button className="mw-say" onClick={() => speakAccent(f.head, 'us')} title={t('mw.listen')}>
                <Icon name="volume" size={17} />
              </button>
            </div>
            <p className="mw-gloss">{gloss ? `${gloss.pos} ${gloss.vi}` : ''}</p>

            <span className="mw-sub">{t('mw.chunks')}</span>
            <div className="mw-chips">
              {chips.map((c) => <span key={c.id} className="mw-chip">{c.en}</span>)}
              {f.members.length > chips.length && <span className="mw-chip more">…</span>}
            </div>

            <div className="mw-acts">
              <button className="mw-cta" onClick={open}>
                {t('mw.deep')} <Icon name="arrow-right" size={16} />
              </button>
              <button className="mw-flipbtn" onClick={() => setFlipped(true)}>
                <Icon name="refresh" size={14} /> {t('mw.flip')}
              </button>
            </div>
          </div>

          <div className="mw-face back" aria-hidden={!flipped}>
            <span className="mw-kicker">{t('mw.meaningOf', { word: f.head })}</span>
            {entry ? (
              <>
                <ol className="mw-senses">
                  {entry.senses.slice(0, 6).map((s, i) => (
                    <li key={i}><b>{s.vi}</b><small>{s.ex}</small></li>
                  ))}
                </ol>
                <p className="mw-more">
                  {t('mw.andCombos', {
                    senses: entry.senses.length,
                    combos: comboCount(entry),
                  })}
                </p>
              </>
            ) : (
              <ul className="mw-meanings">
                {fallback.map((c) => {
                  const lv = recOf(c.id).lv
                  return (
                    <li key={c.id}>
                      <span className={'mw-lv l' + lv}>{lv}</span>
                      <div>
                        <b>{c.en}</b>
                        <small>{c.vi}</small>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="mw-acts">
              <button className="mw-cta" onClick={open}>
                {t('mw.deep')} <Icon name="arrow-right" size={16} />
              </button>
              <button className="mw-flipbtn" onClick={() => setFlipped(false)}>
                <Icon name="refresh" size={14} /> {t('mw.back')}
              </button>
            </div>
          </div>
        </div>

        <div className="mw-chart">
          <span className="mw-sub">{t('mw.mastery')}</span>
          <div className="mw-bars">
            {LEVELS.slice(1).map((l, i) => (
              <div key={l.lv} className="mw-bar">
                <b>{m.pct[i]}%</b>
                <div className="mw-track">
                  <div className={'mw-fill ' + BAR_TONE[i]} style={{ height: `${Math.max(m.pct[i], 2)}%` }} />
                </div>
                <span className="mw-barlv">Level {l.lv}</span>
                <em>{l.name}</em>
              </div>
            ))}
          </div>
          <button className="mw-foot" onClick={open}>
            <span>
              {m.touched === 0
                ? t('mw.footNew', { word: f.head, n: f.members.length })
                : nextLevel
                  ? t('mw.footNext', { level: nextLevel.lv, name: nextLevel.name.toLowerCase() })
                  : t('mw.footDone', { word: f.head })}
            </span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </>
  )
}

export default function MasterWord() {
  const { learnLang } = useAppStore()
  if (learnLang !== 'en' || !FAMILIES.length) return null
  return (
    <MasteryProvider>
      <Card />
    </MasteryProvider>
  )
}
