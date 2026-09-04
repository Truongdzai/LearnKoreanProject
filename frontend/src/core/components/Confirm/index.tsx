import Icon, { type IconName } from '@/core/components/Icon'
import { useDialog } from '@/core/a11y'

interface Props {
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  icon?: IconName
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function Confirm({
  title, body, confirmLabel, cancelLabel, icon = 'bell', danger, onConfirm, onCancel,
}: Props) {
  const box = useDialog<HTMLDivElement>(true, onCancel)
  return (
    <div className="cfm-backdrop" onClick={onCancel}>
      <div
        ref={box}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cfm-title"
        className={'cfm' + (danger ? ' danger' : '')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cfm-head">
          <span className="cfm-ic"><Icon name={icon} size={18} /></span>
          <h3 id="cfm-title">{title}</h3>
        </div>
        <p className="cfm-body">{body}</p>
        <div className="cfm-foot">
          <button type="button" className="btn-ghost sm" onClick={onCancel} data-skip-focus>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? 'cfm-go danger' : 'cfm-go'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
