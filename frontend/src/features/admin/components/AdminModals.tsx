import Icon from '@/core/components/Icon'
import { useDialog } from '@/core/a11y'
import type { AdminPlan, AdminUser, CatalogKind } from '@/core/api/admin.api'
import { FIELDS, KIND_LABEL, addDaysISO, daysLeft, planLabel, planStatus, todayISO } from '../fields'

interface CatalogModalProps {
  kind: CatalogKind
  isNew: boolean
  values: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  onClose: () => void
  onSave: () => void
}

export function CatalogModal({ kind, isNew, values, onChange, onClose, onSave }: CatalogModalProps) {
  return (
    <Backdrop onClose={onClose}>
      <h2>{isNew ? 'Thêm' : 'Sửa'} {KIND_LABEL[kind]}</h2>
      <div className="adm-form">
        {FIELDS[kind].map((f) => (
          <label key={f.k} className={'adm-field' + (f.k === 'descr' || f.k === 'title' ? ' wide' : '')}>
            <span>{f.label}{f.required && ' *'}</span>
            {f.type === 'bool' ? (
              <input type="checkbox" checked={!!values[f.k]} onChange={(e) => onChange({ ...values, [f.k]: e.target.checked })} />
            ) : f.type === 'select' ? (
              <select value={String(values[f.k] ?? '')} onChange={(e) => onChange({ ...values, [f.k]: e.target.value })}>
                {f.opts!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={String(values[f.k] ?? '')}
                disabled={f.k === 'id' && !isNew}
                onChange={(e) => onChange({ ...values, [f.k]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      <Foot onClose={onClose} onSave={onSave} />
    </Backdrop>
  )
}

interface UserModalProps {
  user: AdminUser
  onChange: (u: AdminUser) => void
  plusMode: string
  onPlusMode: (v: string) => void
  plusUntil: string
  onPlusUntil: (v: string) => void
  plans: AdminPlan[]
  onClose: () => void
  onSave: () => void
}

export function UserModal({
  user, onChange, plusMode, onPlusMode, plusUntil, onPlusUntil, plans, onClose, onSave,
}: UserModalProps) {
  const left = daysLeft(plusUntil)
  return (
    <Backdrop onClose={onClose}>
      <h2>Sửa người dùng</h2>
      <div className="adm-form">
        <label className="adm-field"><span>Tên</span>
          <input value={user.name} onChange={(e) => onChange({ ...user, name: e.target.value })} /></label>
        <label className="adm-field"><span>Email</span>
          <input value={user.email || ''} disabled /></label>
        <label className="adm-field"><span>Vai trò</span>
          <select value={user.role} onChange={(e) => onChange({ ...user, role: e.target.value as AdminUser['role'] })}>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select></label>
        <label className="adm-field"><span>Trạng thái</span>
          <select value={user.status} onChange={(e) => onChange({ ...user, status: e.target.value })}>
            <option value="active">Hoạt động</option>
            <option value="locked">Khoá</option>
          </select></label>

        <div className="adm-field wide adm-plusbox">
          <span>Gói Plus — hiện tại: <b>{planStatus(user)}</b></span>
          <select value={plusMode} onChange={(e) => onPlusMode(e.target.value)}>
            <option value="keep">Giữ nguyên</option>
            <option value="until">Đặt / sửa ngày kết thúc</option>
            <option value="lifetime">Plus vĩnh viễn</option>
            <option value="free">Huỷ Plus (Miễn phí)</option>
            {plans.length > 0 && (
              <optgroup label="Cấp theo gói">
                {plans.map((p) => <option key={p.id} value={'plan:' + p.id}>{planLabel(p)}</option>)}
              </optgroup>
            )}
          </select>
          {plusMode === 'until' && (
            <div className="adm-plusdate">
              <input type="date" value={plusUntil} onChange={(e) => onPlusUntil(e.target.value)} />
              <div className="adm-quick">
                <button type="button" onClick={() => onPlusUntil(todayISO())}>Hôm nay</button>
                {[7, 30, 90, 365].map((n) => (
                  <button type="button" key={n} onClick={() => onPlusUntil(addDaysISO(plusUntil, n))}>+{n} ngày</button>
                ))}
              </div>
              <small>
                {left === null ? '' : left < 0
                  ? 'Ngày này đã qua — gói sẽ ở trạng thái hết hạn.'
                  : `Tương đương còn ${left} ngày kể từ hôm nay.`}
              </small>
            </div>
          )}
        </div>

        <label className="adm-field"><span>Xu</span>
          <input type="number" value={user.coins} onChange={(e) => onChange({ ...user, coins: Number(e.target.value) })} /></label>
        <label className="adm-field"><span>XP</span>
          <input type="number" value={user.xp} onChange={(e) => onChange({ ...user, xp: Number(e.target.value) })} /></label>
        <label className="adm-field"><span>Chuỗi ngày</span>
          <input type="number" value={user.streak} onChange={(e) => onChange({ ...user, streak: Number(e.target.value) })} /></label>
      </div>
      <Foot onClose={onClose} onSave={onSave} />
    </Backdrop>
  )
}

interface GiftModalProps {
  user: AdminUser
  amount: number
  onAmount: (n: number) => void
  message: string
  onMessage: (v: string) => void
  onClose: () => void
  onSend: () => void
}

export function GiftModal({ user, amount, onAmount, message, onMessage, onClose, onSend }: GiftModalProps) {
  return (
    <Backdrop onClose={onClose} small>
      <h2><Icon name="gift" size={18} /> Tặng xu cho {user.name}</h2>
      <p className="adm-modal-sub">
        Học viên sẽ nhận thông báo cảm ơn khi đăng nhập lần tới. Để trống lời nhắn để dùng câu mặc định.
      </p>
      <div className="adm-form one">
        <label className="adm-field"><span>Số xu tặng</span>
          <input type="number" min={1} value={amount} onChange={(e) => onAmount(Number(e.target.value))} /></label>
        <div className="adm-quick">
          {[50, 100, 200, 500, 1000].map((n) => (
            <button type="button" key={n} className={amount === n ? 'on' : ''} onClick={() => onAmount(n)}>+{n}</button>
          ))}
        </div>
        <label className="adm-field"><span>Lời nhắn (tuỳ chọn)</span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => onMessage(e.target.value)}
            placeholder={`Cảm ơn sự cố gắng của bạn, vì vậy admin tặng bạn ${amount.toLocaleString('vi')} xu — hãy tiếp tục giữ lửa nhé, fighting!`}
          /></label>
      </div>
      <div className="adm-modal-foot">
        <button type="button" className="adm-btn" onClick={onClose}>Huỷ</button>
        <button type="button" className="adm-btn primary" onClick={onSend}><Icon name="coin" size={15} /> Tặng xu</button>
      </div>
    </Backdrop>
  )
}

function Backdrop({ children, onClose, small }: { children: React.ReactNode; onClose: () => void; small?: boolean }) {
  const box = useDialog<HTMLDivElement>(true, onClose)
  return (
    <div className="adm-backdrop" onClick={onClose}>
      <div
        ref={box}
        tabIndex={-1}
        className={'adm-modal' + (small ? ' sm' : '')}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="adm-modal-x" onClick={onClose} aria-label="Đóng" data-skip-focus><Icon name="x" size={16} /></button>
        {children}
      </div>
    </div>
  )
}

function Foot({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="adm-modal-foot">
      <button type="button" className="adm-btn" onClick={onClose}>Huỷ</button>
      <button type="button" className="adm-btn primary" onClick={onSave}><Icon name="check" size={15} /> Lưu</button>
    </div>
  )
}
