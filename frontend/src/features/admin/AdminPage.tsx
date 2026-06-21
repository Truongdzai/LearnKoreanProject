import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import {
  fetchAdminStats, fetchAdminCatalog, fetchAdminUsers, saveCatalogItem, deleteCatalogItem,
  updateAdminUser, deleteAdminUser, giftCoins, setUserPlus,
  type AdminStats, type AdminUser, type AdminCatalog, type CatalogKind, type AdminPlan,
} from '@/core/api/admin.api'
import { formatDate } from '@/core/utils/format'
import { useAuth } from '@/store/auth.store'

type Tab = 'overview' | 'users' | 'videos' | 'quests' | 'shop' | 'plans'

interface Field { k: string; label: string; type?: 'text' | 'number' | 'bool' | 'select'; opts?: string[]; required?: boolean }

const PAGE_SIZE = 20
const CAT_PAGE_SIZE = 8

const CAT_FILTERS: Record<CatalogKind, { k: string; label: string } | null> = {
  videos: { k: 'level', label: 'cấp độ' },
  quests: { k: 'period', label: 'chu kỳ' },
  shop: { k: 'category', label: 'loại' },
  plans: null,
}

const FIELDS: Record<CatalogKind, Field[]> = {
  videos: [
    { k: 'id', label: 'Mã video (YouTube ID)', required: true },
    { k: 'title', label: 'Tiêu đề', required: true },
    { k: 'channel', label: 'Kênh' },
    { k: 'level', label: 'Cấp độ' },
    { k: 'dur', label: 'Thời lượng' },
    { k: 'topic', label: 'Chủ đề' },
    { k: 'tone', label: 'Màu (tone-a … tone-f)' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Hiển thị', type: 'bool' },
  ],
  quests: [
    { k: 'id', label: 'Mã', required: true },
    { k: 'title', label: 'Tên nhiệm vụ', required: true },
    { k: 'descr', label: 'Mô tả' },
    { k: 'period', label: 'Chu kỳ', type: 'select', opts: ['daily', 'weekly', 'monthly'] },
    { k: 'metric', label: 'Loại đo', type: 'select', opts: ['lesson', 'pronounce', 'review', 'video', 'word', 'streak', 'login'] },
    { k: 'reward', label: 'Thưởng (xu)', type: 'number' },
    { k: 'target', label: 'Mục tiêu', type: 'number' },
    { k: 'plus', label: 'Chỉ Plus', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Bật', type: 'bool' },
  ],
  shop: [
    { k: 'id', label: 'Mã', required: true },
    { k: 'name', label: 'Tên vật phẩm', required: true },
    { k: 'descr', label: 'Mô tả' },
    { k: 'price', label: 'Giá (xu)', type: 'number' },
    { k: 'category', label: 'Loại', type: 'select', opts: ['seed', 'frame', 'avatar', 'badge'] },
    { k: 'art', label: 'Art key', required: true },
    { k: 'plus', label: 'Chỉ Plus', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Bật', type: 'bool' },
  ],
  plans: [
    { k: 'id', label: 'Mã gói', required: true },
    { k: 'name', label: 'Tên gói', required: true },
    { k: 'tagline', label: 'Khẩu hiệu' },
    { k: 'original', label: 'Giá gốc (gạch ngang)' },
    { k: 'price', label: 'Giá hiển thị' },
    { k: 'unit', label: 'Đơn vị (vd /tháng)' },
    { k: 'note', label: 'Ghi chú' },
    { k: 'cta', label: 'Nút (CTA)' },
    { k: 'days', label: 'Số ngày Plus (0 = vĩnh viễn)', type: 'number' },
    { k: 'featured', label: 'Nổi bật', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Hiển thị', type: 'bool' },
  ],
}

const KIND_LABEL: Record<CatalogKind, string> = { videos: 'video', quests: 'nhiệm vụ', shop: 'vật phẩm', plans: 'gói đăng ký' }

function initialValues(fields: Field[], item?: Record<string, unknown>): Record<string, unknown> {
  const v: Record<string, unknown> = {}
  for (const f of fields) {
    let raw = item?.[f.k]
    if (raw === undefined && f.k === 'descr') raw = item?.['desc']
    if (f.type === 'bool') v[f.k] = raw === undefined ? true : !!raw
    else if (f.type === 'number') v[f.k] = raw ?? 0
    else if (f.type === 'select') v[f.k] = raw ?? f.opts?.[0] ?? ''
    else v[f.k] = raw ?? ''
  }
  return v
}

function planLabel(p: AdminPlan): string {
  return `${p.name} · ${p.days > 0 ? p.days + ' ngày' : 'vĩnh viễn'}`
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDaysISO(base: string, n: number): string {
  const d = new Date((base || todayISO()) + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysLeft(until?: string | null): number | null {
  if (!until) return null
  const end = new Date(String(until).slice(0, 10) + 'T00:00:00')
  if (isNaN(end.getTime())) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - now.getTime()) / 86400000)
}

function planStatus(u: AdminUser): string {
  if (u.isPlus) {
    if (!u.plusUntil) return 'Plus · vĩnh viễn'
    const d = daysLeft(u.plusUntil)
    if (d === null) return 'Plus'
    if (d <= 0) return `Plus · hết hạn hôm nay (${formatDate(u.plusUntil)})`
    return `Plus · còn ${d} ngày — đến ${formatDate(u.plusUntil)}`
  }
  if (u.plusUntil) return `Đã hết hạn ${formatDate(u.plusUntil)}`
  return 'Miễn phí'
}

export default function AdminPage() {
  const { account } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null)
  const [flash, setFlash] = useState('')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fPlus, setFPlus] = useState('')
  const [fSort, setFSort] = useState('recent')

  const [catSearch, setCatSearch] = useState('')
  const [catActive, setCatActive] = useState('all')
  const [catFilter, setCatFilter] = useState('')
  const [catPage, setCatPage] = useState(1)

  const [editKind, setEditKind] = useState<CatalogKind | null>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})
  const [editingNew, setEditingNew] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editPlusMode, setEditPlusMode] = useState('keep')
  const [editPlusUntil, setEditPlusUntil] = useState(todayISO())
  const [giftUser, setGiftUser] = useState<AdminUser | null>(null)
  const [giftAmount, setGiftAmount] = useState(100)
  const [giftMsg, setGiftMsg] = useState('')

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2600) }

  const loadStats = useCallback(() => { fetchAdminStats().then(setStats).catch(() => {}) }, [])
  const loadCatalog = useCallback(() => { fetchAdminCatalog().then(setCatalog).catch(() => {}) }, [])
  const loadUsers = useCallback(() => {
    fetchAdminUsers({ q, role: fRole, status: fStatus, plus: fPlus, sort: fSort, page, pageSize: PAGE_SIZE })
      .then((r) => { setUsers(r.users); setTotal(r.total) })
      .catch(() => {})
  }, [q, fRole, fStatus, fPlus, fSort, page])

  useEffect(() => { loadStats(); loadCatalog() }, [loadStats, loadCatalog])
  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { setCatSearch(''); setCatActive('all'); setCatFilter(''); setCatPage(1) }, [tab])

  const planOptions = useMemo(() => (catalog?.plans || []).filter((p) => p.active), [catalog])

  const statCards = useMemo(() => stats ? [
    { ic: 'user', label: 'Tổng người dùng', val: stats.users, tone: 'blue' },
    { ic: 'sparkles', label: 'Thành viên Plus', val: stats.plus, tone: 'gold' },
    { ic: 'flame', label: 'Hoạt động hôm nay', val: stats.activeToday, tone: 'fire' },
    { ic: 'trending', label: 'Mới (7 ngày)', val: stats.newWeek, tone: 'violet' },
    { ic: 'film', label: 'Video trong kho', val: stats.videos, tone: 'blue' },
    { ic: 'target', label: 'Nhiệm vụ', val: stats.quests, tone: 'violet' },
    { ic: 'store', label: 'Vật phẩm', val: stats.shop, tone: 'gold' },
    { ic: 'crown', label: 'Gói đăng ký', val: stats.plans, tone: 'gold' },
    { ic: 'cards', label: 'Thẻ từ vựng', val: stats.srsCards, tone: 'blue' },
    { ic: 'book', label: 'Mục từ điển', val: stats.dictEntries, tone: 'violet' },
  ] as const : [], [stats])

  const resetPage = () => setPage(1)

  const openNew = (kind: CatalogKind) => {
    setEditKind(kind); setEditingNew(true); setEditValues(initialValues(FIELDS[kind]))
  }
  const openEdit = (kind: CatalogKind, item: Record<string, unknown>) => {
    setEditKind(kind); setEditingNew(false); setEditValues(initialValues(FIELDS[kind], item))
  }
  const closeEdit = () => { setEditKind(null); setEditValues({}) }

  const saveEdit = async () => {
    if (!editKind) return
    const data: Record<string, unknown> = {}
    for (const f of FIELDS[editKind]) {
      const val = editValues[f.k]
      data[f.k] = f.type === 'bool' ? (val ? 1 : 0) : val
    }
    if (!String(data.id || '').trim()) { showFlash('Hãy nhập Mã (id).'); return }
    try {
      await saveCatalogItem(editKind, data)
      showFlash('Đã lưu.')
      closeEdit()
      loadCatalog(); loadStats()
    } catch (e) { showFlash((e as Error).message) }
  }

  const remove = async (kind: CatalogKind, id: string) => {
    if (!window.confirm(`Xoá ${KIND_LABEL[kind]} "${id}"?`)) return
    try {
      await deleteCatalogItem(kind, id)
      showFlash('Đã xoá.')
      loadCatalog(); loadStats()
    } catch (e) { showFlash((e as Error).message) }
  }

  const openEditUser = (u: AdminUser) => {
    setEditUser({ ...u })
    setEditPlusMode('keep')
    setEditPlusUntil(u.plusUntil ? String(u.plusUntil).slice(0, 10) : addDaysISO(todayISO(), 30))
  }

  const saveUser = async () => {
    if (!editUser) return
    try {
      await updateAdminUser({
        id: editUser.id, name: editUser.name, role: editUser.role, status: editUser.status,
        coins: editUser.coins, xp: editUser.xp, streak: editUser.streak,
      } as never)
      if (editPlusMode === 'until') await setUserPlus(editUser.id, { action: 'until', until: editPlusUntil })
      else if (editPlusMode.startsWith('plan:')) await setUserPlus(editUser.id, { action: 'plan', plan_id: editPlusMode.slice(5) })
      else if (editPlusMode === 'lifetime' || editPlusMode === 'free') await setUserPlus(editUser.id, { action: editPlusMode })
      showFlash('Đã cập nhật người dùng.')
      setEditUser(null)
      loadUsers(); loadStats()
    } catch (e) { showFlash((e as Error).message) }
  }

  const removeUser = async (u: AdminUser) => {
    if (!window.confirm(`Xoá người dùng "${u.name}"? Hành động không thể hoàn tác.`)) return
    try {
      await deleteAdminUser(u.id)
      showFlash('Đã xoá người dùng.')
      loadUsers(); loadStats()
    } catch (e) { showFlash((e as Error).message) }
  }

  const openGift = (u: AdminUser) => { setGiftUser(u); setGiftAmount(100); setGiftMsg('') }

  const sendGift = async () => {
    if (!giftUser) return
    if (giftAmount <= 0) { showFlash('Số xu phải lớn hơn 0.'); return }
    try {
      await giftCoins(giftUser.id, giftAmount, giftMsg)
      showFlash(`Đã tặng ${giftAmount.toLocaleString('vi')} xu cho ${giftUser.name}.`)
      setGiftUser(null)
      loadUsers()
    } catch (e) { showFlash((e as Error).message) }
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const plusCell = (u: AdminUser) => {
    if (u.isPlus) {
      if (!u.plusUntil) return <span className="admin-plus"><Icon name="sparkles" size={12} /> Vĩnh viễn</span>
      const d = daysLeft(u.plusUntil)
      return (
        <span className={'admin-plus' + (d !== null && d <= 7 ? ' soon' : '')} title={planStatus(u)}>
          <Icon name="sparkles" size={12} /> {d !== null && d > 0 ? `Còn ${d} ngày` : 'Hết hạn hôm nay'}
        </span>
      )
    }
    if (u.plusUntil) return <span className="admin-plus exp" title={planStatus(u)}>Hết hạn {formatDate(u.plusUntil)}</span>
    return <>—</>
  }

  const catalogTable = (kind: CatalogKind, rows: Record<string, unknown>[], cols: { k: string; label: string }[]) => {
    const ql = catSearch.trim().toLowerCase()
    const fcfg = CAT_FILTERS[kind]
    const filterOpts = fcfg
      ? Array.from(new Set(rows.map((r) => String(r[fcfg.k] ?? '')).filter(Boolean))).sort()
      : []

    let shown = rows
    if (ql) shown = shown.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(ql)))
    if (catActive !== 'all') shown = shown.filter((r) => (catActive === 'on' ? !!r.active : !r.active))
    if (fcfg && catFilter) shown = shown.filter((r) => String(r[fcfg.k] ?? '') === catFilter)

    const pageCount = Math.max(1, Math.ceil(shown.length / CAT_PAGE_SIZE))
    const cur = Math.min(catPage, pageCount)
    const paged = shown.slice((cur - 1) * CAT_PAGE_SIZE, cur * CAT_PAGE_SIZE)

    return (
      <div className="admin-card">
        <div className="admin-card-head admin-filters">
          <div className="admin-search">
            <Icon name="search" size={15} />
            <input value={catSearch} onChange={(e) => { setCatSearch(e.target.value); setCatPage(1) }} placeholder={`Tìm ${KIND_LABEL[kind]}…`} />
          </div>
          {fcfg && (
            <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setCatPage(1) }}>
              <option value="">Mọi {fcfg.label}</option>
              {filterOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          <select value={catActive} onChange={(e) => { setCatActive(e.target.value); setCatPage(1) }}>
            <option value="all">Mọi trạng thái</option>
            <option value="on">Đang bật</option>
            <option value="off">Đang tắt</option>
          </select>
          <div className="admin-head-right">
            <b>{shown.length}/{rows.length}</b>
            <button className="btn-primary sm" onClick={() => openNew(kind)}><Icon name="plus" size={14} /> Thêm</button>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{cols.map((c) => <th key={c.k}>{c.label}</th>)}<th>Bật</th><th></th></tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={String(r.id)} className={r.active ? '' : 'off'}>
                  {cols.map((c) => <td key={c.k} title={String(r[c.k] ?? '')}>{String(r[c.k] ?? '')}</td>)}
                  <td>{r.active ? '✓' : '—'}</td>
                  <td className="admin-row-actions">
                    <button onClick={() => openEdit(kind, r)} title="Sửa"><Icon name="note" size={15} /></button>
                    <button onClick={() => remove(kind, String(r.id))} title="Xoá"><Icon name="trash" size={15} /></button>
                  </td>
                </tr>
              ))}
              {!paged.length && (
                <tr><td colSpan={cols.length + 2} className="admin-empty">Không có {KIND_LABEL[kind]} nào khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="admin-pager">
            <span>{shown.length.toLocaleString('vi')} mục · Trang {cur}/{pageCount}</span>
            <div className="admin-pager-btns">
              <button className="btn-ghost sm" disabled={cur <= 1} onClick={() => setCatPage(cur - 1)}>
                <Icon name="chevron-left" size={15} /> Trước
              </button>
              <button className="btn-ghost sm" disabled={cur >= pageCount} onClick={() => setCatPage(cur + 1)}>
                Sau <Icon name="chevron-down" size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <div>
          <h1 className="page-title"><Icon name="settings" /> Trang quản trị</h1>
          <p className="page-sub">Xin chào {account?.name} — quản lý nội dung, người dùng và theo dõi thống kê.</p>
        </div>
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      <div className="admin-tabs">
        {([
          ['overview', 'Tổng quan', 'chart'],
          ['users', 'Người dùng', 'user'],
          ['videos', 'Video', 'film'],
          ['quests', 'Nhiệm vụ', 'target'],
          ['shop', 'Cửa hàng', 'store'],
          ['plans', 'Gói đăng ký', 'crown'],
        ] as [Tab, string, string][]).map(([id, label, ic]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            <Icon name={ic as never} size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-stats">
          {statCards.map((s) => (
            <div key={s.label} className={'act-stat ' + s.tone}>
              <span className="act-stat-ic"><Icon name={s.ic as never} size={20} /></span>
              <div>
                <b>{s.val.toLocaleString('vi')}</b>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-card">
          <div className="admin-card-head admin-filters">
            <div className="admin-search">
              <Icon name="search" size={15} />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setQ(qInput); resetPage() } }}
                placeholder="Tìm theo tên, email hoặc SĐT…"
              />
            </div>
            <select value={fRole} onChange={(e) => { setFRole(e.target.value); resetPage() }}>
              <option value="">Mọi vai trò</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <select value={fStatus} onChange={(e) => { setFStatus(e.target.value); resetPage() }}>
              <option value="">Mọi trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Đã khoá</option>
            </select>
            <select value={fPlus} onChange={(e) => { setFPlus(e.target.value); resetPage() }}>
              <option value="">Mọi gói</option>
              <option value="plus">Đang Plus</option>
              <option value="free">Miễn phí</option>
            </select>
            <select value={fSort} onChange={(e) => { setFSort(e.target.value); resetPage() }}>
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="active">Hoạt động gần đây</option>
              <option value="coins">Nhiều xu nhất</option>
              <option value="xp">Nhiều XP nhất</option>
              <option value="name">Tên (A→Z)</option>
            </select>
            <button className="btn-ghost sm" onClick={() => { setQ(qInput); resetPage() }}>Lọc</button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Gói</th><th>Xu</th><th>XP</th><th>Chuỗi</th><th>Trạng thái</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.status === 'active' ? '' : 'off'}>
                    <td>{u.name}</td>
                    <td title={u.email || ''}>{u.email || u.phone || '—'}</td>
                    <td>{u.role === 'admin' ? <span className="admin-badge">Admin</span> : 'Người dùng'}</td>
                    <td>{plusCell(u)}</td>
                    <td>{u.coins.toLocaleString('vi')}</td>
                    <td>{u.xp.toLocaleString('vi')}</td>
                    <td>{u.streak}</td>
                    <td>{u.status === 'active' ? 'Hoạt động' : 'Đã khoá'}</td>
                    <td className="admin-row-actions">
                      <button onClick={() => openGift(u)} title="Tặng xu"><Icon name="gift" size={15} /></button>
                      <button onClick={() => openEditUser(u)} title="Sửa"><Icon name="note" size={15} /></button>
                      {u.role !== 'admin' && (
                        <button onClick={() => removeUser(u)} title="Xoá"><Icon name="trash" size={15} /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td colSpan={9} className="admin-empty">Không có người dùng nào khớp bộ lọc.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pager">
            <span>{total.toLocaleString('vi')} người dùng · Trang {page}/{pageCount}</span>
            <div className="admin-pager-btns">
              <button className="btn-ghost sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <Icon name="chevron-left" size={15} /> Trước
              </button>
              <button className="btn-ghost sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                Sau <Icon name="chevron-down" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'videos' && catalog && catalogTable('videos', catalog.videos as unknown as Record<string, unknown>[], [
        { k: 'id', label: 'Mã' }, { k: 'title', label: 'Tiêu đề' }, { k: 'channel', label: 'Kênh' }, { k: 'level', label: 'Cấp' },
      ])}
      {tab === 'quests' && catalog && catalogTable('quests', catalog.quests as unknown as Record<string, unknown>[], [
        { k: 'id', label: 'Mã' }, { k: 'title', label: 'Tên' }, { k: 'period', label: 'Chu kỳ' }, { k: 'reward', label: 'Thưởng' }, { k: 'target', label: 'Mục tiêu' },
      ])}
      {tab === 'shop' && catalog && catalogTable('shop', catalog.shop as unknown as Record<string, unknown>[], [
        { k: 'id', label: 'Mã' }, { k: 'name', label: 'Tên' }, { k: 'category', label: 'Loại' }, { k: 'price', label: 'Giá' },
      ])}
      {tab === 'plans' && catalog && catalogTable('plans', catalog.plans as unknown as Record<string, unknown>[], [
        { k: 'id', label: 'Mã' }, { k: 'name', label: 'Tên' }, { k: 'price', label: 'Giá' }, { k: 'days', label: 'Số ngày' },
      ])}

      {editKind && (
        <div className="auth-backdrop" onClick={closeEdit}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lookup-close auth-close" onClick={closeEdit}><Icon name="x" /></button>
            <h2>{editingNew ? 'Thêm' : 'Sửa'} {KIND_LABEL[editKind]}</h2>
            <div className="admin-form">
              {FIELDS[editKind].map((f) => (
                <label key={f.k} className="admin-field">
                  <span>{f.label}{f.required && ' *'}</span>
                  {f.type === 'bool' ? (
                    <input type="checkbox" checked={!!editValues[f.k]} onChange={(e) => setEditValues((v) => ({ ...v, [f.k]: e.target.checked }))} />
                  ) : f.type === 'select' ? (
                    <select value={String(editValues[f.k] ?? '')} onChange={(e) => setEditValues((v) => ({ ...v, [f.k]: e.target.value }))}>
                      {f.opts!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={String(editValues[f.k] ?? '')}
                      disabled={f.k === 'id' && !editingNew}
                      onChange={(e) => setEditValues((v) => ({ ...v, [f.k]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="admin-modal-foot">
              <button className="btn-ghost" onClick={closeEdit}>Huỷ</button>
              <button className="btn-primary" onClick={saveEdit}><Icon name="check" size={15} /> Lưu</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="auth-backdrop" onClick={() => setEditUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lookup-close auth-close" onClick={() => setEditUser(null)}><Icon name="x" /></button>
            <h2>Sửa người dùng</h2>
            <div className="admin-form">
              <label className="admin-field"><span>Tên</span>
                <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} /></label>
              <label className="admin-field"><span>Email</span>
                <input value={editUser.email || ''} disabled /></label>
              <label className="admin-field"><span>Vai trò</span>
                <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value as AdminUser['role'] })}>
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select></label>
              <label className="admin-field"><span>Trạng thái</span>
                <select value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="locked">Khoá</option>
                </select></label>
              <div className="admin-field admin-field-wide admin-plus-box">
                <span>Gói Plus — hiện tại: <b className={editUser.isPlus ? 'admin-plus' : ''}>{planStatus(editUser)}</b></span>
                <select value={editPlusMode} onChange={(e) => setEditPlusMode(e.target.value)}>
                  <option value="keep">Giữ nguyên</option>
                  <option value="until">Đặt / sửa ngày kết thúc</option>
                  <option value="lifetime">Plus vĩnh viễn</option>
                  <option value="free">Huỷ Plus (Miễn phí)</option>
                  {planOptions.length > 0 && (
                    <optgroup label="Cấp theo gói">
                      {planOptions.map((p) => <option key={p.id} value={'plan:' + p.id}>{planLabel(p)}</option>)}
                    </optgroup>
                  )}
                </select>
                {editPlusMode === 'until' && (
                  <div className="admin-plus-date">
                    <input type="date" value={editPlusUntil} onChange={(e) => setEditPlusUntil(e.target.value)} />
                    <div className="admin-gift-quick">
                      <button type="button" className="admin-chip" onClick={() => setEditPlusUntil(todayISO())}>Hôm nay</button>
                      {[7, 30, 90, 365].map((n) => (
                        <button type="button" key={n} className="admin-chip" onClick={() => setEditPlusUntil((d) => addDaysISO(d, n))}>+{n} ngày</button>
                      ))}
                    </div>
                    <small className="admin-gift-hint">
                      {(() => { const d = daysLeft(editPlusUntil); return d === null ? '' : d < 0 ? `Ngày này đã qua — gói sẽ ở trạng thái hết hạn.` : `Tương đương còn ${d} ngày kể từ hôm nay.` })()}
                    </small>
                  </div>
                )}
              </div>
              <label className="admin-field"><span>Xu</span>
                <input type="number" value={editUser.coins} onChange={(e) => setEditUser({ ...editUser, coins: Number(e.target.value) })} /></label>
              <label className="admin-field"><span>XP</span>
                <input type="number" value={editUser.xp} onChange={(e) => setEditUser({ ...editUser, xp: Number(e.target.value) })} /></label>
              <label className="admin-field"><span>Chuỗi ngày</span>
                <input type="number" value={editUser.streak} onChange={(e) => setEditUser({ ...editUser, streak: Number(e.target.value) })} /></label>
            </div>
            <div className="admin-modal-foot">
              <button className="btn-ghost" onClick={() => setEditUser(null)}>Huỷ</button>
              <button className="btn-primary" onClick={saveUser}><Icon name="check" size={15} /> Lưu</button>
            </div>
          </div>
        </div>
      )}

      {giftUser && (
        <div className="auth-backdrop" onClick={() => setGiftUser(null)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <button className="lookup-close auth-close" onClick={() => setGiftUser(null)}><Icon name="x" /></button>
            <h2><Icon name="gift" size={18} /> Tặng xu cho {giftUser.name}</h2>
            <p className="admin-gift-hint">Học viên sẽ nhận thông báo cảm ơn khi đăng nhập lần tới. Để trống lời nhắn để dùng câu mặc định.</p>
            <div className="admin-form admin-form-1">
              <label className="admin-field"><span>Số xu tặng</span>
                <input type="number" min={1} value={giftAmount} onChange={(e) => setGiftAmount(Number(e.target.value))} /></label>
              <div className="admin-gift-quick">
                {[50, 100, 200, 500, 1000].map((n) => (
                  <button key={n} className={'admin-chip' + (giftAmount === n ? ' on' : '')} onClick={() => setGiftAmount(n)}>+{n}</button>
                ))}
              </div>
              <label className="admin-field"><span>Lời nhắn (tuỳ chọn)</span>
                <textarea
                  rows={3}
                  value={giftMsg}
                  onChange={(e) => setGiftMsg(e.target.value)}
                  placeholder={`Cảm ơn sự cố gắng của bạn, vì vậy admin tặng bạn ${giftAmount.toLocaleString('vi')} xu — hãy tiếp tục giữ lửa nhé, fighting! 🔥`}
                /></label>
            </div>
            <div className="admin-modal-foot">
              <button className="btn-ghost" onClick={() => setGiftUser(null)}>Huỷ</button>
              <button className="btn-primary" onClick={sendGift}><Icon name="coin" size={15} /> Tặng xu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
