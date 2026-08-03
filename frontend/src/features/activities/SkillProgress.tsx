import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { skillAvg, skillBand, skillSeries, skillTrend, type SkillKey, type SkillLog } from '@/core/skills'

const SKILLS: { key: SkillKey; labelKey: string; icon: IconName; tone: string }[] = [
  { key: 'listen', labelKey: 'skill.listen', icon: 'headphones', tone: 'blue' },
  { key: 'speak', labelKey: 'skill.speak', icon: 'mic', tone: 'violet' },
]

const SPAN = 14

export default function SkillProgress({ log }: { log: SkillLog }) {
  const { t } = useAppStore()
  const hasAny = log.days.some((d) => d.ln > 0 || d.sn > 0)

  return (
    <div className="act-card skill-card">
      <div className="act-card-head">
        <b>{t('skill.title')}</b>
        <span>{t('skill.sub')}</span>
      </div>

      {!hasAny ? (
        <p className="skill-empty">{t('skill.empty')}</p>
      ) : (
        <div className="skill-grid">
          {SKILLS.map((s) => {
            const { avg, reps } = skillAvg(log, s.key, 30)
            const band = skillBand(avg)
            const trend = skillTrend(log, s.key)
            const pts = skillSeries(log, s.key, SPAN)
            return (
              <div key={s.key} className={'skill-block ' + s.tone}>
                <div className="skill-head">
                  <span className="skill-ic"><Icon name={s.icon} size={18} /></span>
                  <div>
                    <b>{t(s.labelKey)}</b>
                    <span className={'skill-band ' + band.tone}>{t(band.labelKey)}</span>
                  </div>
                  <div className="skill-num">
                    <b>{avg === null ? '—' : avg + '%'}</b>
                    <small>{t('skill.avg30')} · {t('skill.reps', { n: reps })}</small>
                  </div>
                </div>

                <div className="skill-spark" role="img" aria-label={t(s.labelKey) + ' ' + (avg === null ? '' : avg + '%')}>
                  {pts.map((p) => (
                    <span
                      key={p.d}
                      className={'skill-bar' + (p.avg === null ? ' none' : '')}
                      style={p.avg === null ? undefined : { height: Math.max(6, p.avg) + '%' }}
                      title={p.avg === null ? p.d : t('skill.day', { d: p.d.slice(5), n: p.avg, r: p.n })}
                    />
                  ))}
                </div>

                {trend !== null && (
                  <div className={'skill-trend' + (trend > 2 ? ' up' : trend < -2 ? ' down' : '')}>
                    <Icon name="trending" size={14} />
                    {trend > 2 ? t('skill.up', { n: trend }) : trend < -2 ? t('skill.down', { n: -trend }) : t('skill.flat')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
