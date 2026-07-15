import { useAppStore } from '@/store/app.store'
import Icon, { type IconName } from '@/core/components/Icon'
import type { AppView } from '@/core/constants/enum'

const INFO: Record<string, { ic: IconName; h: string; p: string }> = {
  myvideos: { ic: 'tv', h: 'ph.myvideos', p: 'ph.myvideosText' },
  courses: { ic: 'book', h: 'ph.courses', p: 'ph.coursesText' },
  vocab: { ic: 'letters', h: 'ph.vocab', p: 'ph.vocabText' },
}

export default function Placeholder({ view }: { view: AppView }) {
  const { setView, t } = useAppStore()
  const x = INFO[view] ?? { ic: 'tool' as IconName, h: 'ph.soon', p: 'ph.soonText' }
  return (
    <>
      <h1 className="page-title">{t(x.h)}</h1>
      <div className="soon" style={{ marginTop: 14 }}>
        <div className="big"><Icon name={x.ic} /></div>
        <h3>{t('ph.building')}</h3>
        <p>{t(x.p)}</p>
        <button className="btn-new" style={{ marginTop: 14 }} onClick={() => setView('home')}>
          <Icon name="arrow-left" /> {t('ph.backHome')}
        </button>
      </div>
    </>
  )
}
