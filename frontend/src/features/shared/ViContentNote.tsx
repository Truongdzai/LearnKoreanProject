import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

export default function ViContentNote() {
  const { uiLang, t } = useAppStore()
  if (uiLang !== 'en') return null
  return (
    <div className="vi-note">
      <Icon name="bulb" size={15} />
      <span>{t('viNote')}</span>
    </div>
  )
}
