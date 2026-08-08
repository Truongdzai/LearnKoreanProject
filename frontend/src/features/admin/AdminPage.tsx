import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import {
  fetchAdminStats, fetchAdminSeries, fetchAdminCatalog, fetchAdminUsers, saveCatalogItem, deleteCatalogItem,
  updateAdminUser, deleteAdminUser, giftCoins, setUserPlus,
  fetchAdminFeedback, setFeedbackStatus, deleteFeedback, fetchAdminAudit,
  type AdminStats, type AdminSeries, type AdminUser, type AdminCatalog, type CatalogKind,
  type AdminFeedback, type AuditEntry, type SeriesMetric,
} from '@/core/api/admin.api'
import { formatDate } from '@/core/utils/format'
import { studyLang } from '@/core/constants/languages'
import AdminShell, { SETTINGS_TABS } from './components/AdminShell'
import type { SearchHit, Section, SettingsTab } from './components/AdminShell'
import DataTable, { Pager, paginate, useSort } from './components/DataTable'
import type { Col } from './components/DataTable'
import KpiCard, { DeltaChip } from './components/KpiCard'
import TrendChart, { Sparkline } from './components/TrendChart'
import { CatalogModal, GiftModal, UserModal } from './components/AdminModals'
import {
  ALL_METRICS, KPI_METRICS, METRIC_LABEL, METRIC_SHORT, RANGES, RANGE_LABEL, RANGE_SHORT,
  fmtDayLong, fmtInt,
} from './metrics'
import {
  AUDIT_LABEL, CAT_FILTERS, CAT_PAGE_SIZE, FIELDS, KIND_LABEL, PAGE_SIZE,
  addDaysISO, daysLeft, initialValues, planStatus, todayISO,
} from './fields'

type Row = Record<string, unknown>

const USER_SORT: Record<string, { asc: string; desc: string }> = {
  name: { asc: 'name', desc: 'name_desc' },
  coins: { asc: 'coins_asc', desc: 'coins' },
  xp: { asc: 'xp_asc', desc: 'xp' },
  streak: { asc: 'streak_asc', desc: 'streak' },
  createdAt: { asc: 'oldest', desc: 'recent' },
  lastActive: { asc: 'active_asc', desc: 'active' },
}

const CAT_COLS: Record<CatalogKind, { k: string; label: string; num?: boolean }[]> = {
  videos: [
    { k: 'id', label: 'Mã' }, { k: 'title', label: 'Tiêu đề' },
    { k: 'channel', label: 'Kênh' }, { k: 'level', label: 'Cấp' }, { k: 'lang', label: 'Ngôn ngữ' },
  ],
  quests: [
    { k: 'id', label: 'Mã' }, { k: 'title', label: 'Tên' }, { k: 'period', label: 'Chu kỳ' },
    { k: 'reward', label: 'Thưởng', num: true }, { k: 'target', label: 'Mục tiêu', num: true },
  ],
  shop: [
    { k: 'id', label: 'Mã' }, { k: 'name', label: 'Tên' },
    { k: 'category', label: 'Loại' }, { k: 'price', label: 'Giá', num: true },
  ],
  plans: [
    { k: 'id', label: 'Mã' }, { k: 'name', label: 'Tên' },
    { k: 'price', label: 'Giá' }, { k: 'days', label: 'Số ngày', num: true },
  ],
}

const FB_LABEL: Record<string, string> = { new: 'Mới', seen: 'Đã xem', done: 'Đã xử lý' }

export default function AdminPage() {
  const [section, setSection] = useState<Section>('overview')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('videos')
  const [workspace, setWorkspace] = useState('')
  const [gq, setGq] = useState('')
  const [flash, setFlash] = useState('')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [series, setSeries] = useState<AdminSeries | null>(null)
  const [days, setDays] = useState<number>(30)
  const [metric, setMetric] = useState<SeriesMetric>('active')
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fPlus, setFPlus] = useState('')
  const [uSort, setUSort] = useState({ k: 'createdAt', dir: 'desc' as 'asc' | 'desc' })

  const [catSearch, setCatSearch] = useState('')
  const [catActive, setCatActive] = useState('all')
  const [catFilter, setCatFilter] = useState('')
  const [catPage, setCatPage] = useState(1)

  const [editKind, setEditKind] = useState<CatalogKind | null>(null)
  const [editValues, setEditValues] = useState<Row>({})
  const [editingNew, setEditingNew] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editPlusMode, setEditPlusMode] = useState('keep')
  const [editPlusUntil, setEditPlusUntil] = useState(todayISO())
  const [giftUser, setGiftUser] = useState<AdminUser | null>(null)
  const [giftAmount, setGiftAmount] = useState(100)
  const [giftMsg, setGiftMsg] = useState('')

  const [fb, setFb] = useState<AdminFeedback[]>([])
  const [fbTotal, setFbTotal] = useState(0)
  const [fbStatus, setFbStatus] = useState('')
  const [fbPage, setFbPage] = useState(1)

  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditActions, setAuditActions] = useState<string[]>([])
  const [auditAction, setAuditAction] = useState('')
  const [auditPage, setAuditPage] = useState(1)

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2600) }

  const loadStats = useCallback(() => { fetchAdminStats().then(setStats).catch(() => {}) }, [])
  const loadCatalog = useCallback(() => { fetchAdminCatalog().then(setCatalog).catch(() => {}) }, [])
  const loadSeries = useCallback(() => { fetchAdminSeries(days).then(setSeries).catch(() => {}) }, [days])

  const sortParam = USER_SORT[uSort.k]?.[uSort.dir] || 'recent'
  const loadUsers = useCallback(() => {
    fetchAdminUsers({ q, role: fRole, status: fStatus, plus: fPlus, sort: sortParam, page, pageSize: PAGE_SIZE })
      .then((r) => { setUsers(r.users); setTotal(r.total) })
      .catch(() => {})
  }, [q, fRole, fStatus, fPlus, sortParam, page])

  const loadFeedback = useCallback(() => {
    fetchAdminFeedback(fbStatus, fbPage, PAGE_SIZE)
      .then((r) => { setFb(r.items); setFbTotal(r.total) })
      .catch(() => {})
  }, [fbStatus, fbPage])

  const loadAudit = useCallback(() => {
    fetchAdminAudit(auditAction, auditPage, PAGE_SIZE)
      .then((r) => { setAudit(r.items); setAuditTotal(r.total); setAuditActions(r.actions) })
      .catch(() => {})
  }, [auditAction, auditPage])

  useEffect(() => { loadStats(); loadCatalog() }, [loadStats, loadCatalog])
  useEffect(() => { loadSeries() }, [loadSeries])
  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { if (settingsTab === 'feedback' && section === 'settings') loadFeedback() }, [section, settingsTab, loadFeedback])
  useEffect(() => { if (settingsTab === 'audit' && section === 'settings') loadAudit() }, [section, settingsTab, loadAudit])
  useEffect(() => { setCatSearch(''); setCatActive('all'); setCatFilter(''); setCatPage(1) }, [settingsTab])

  const planOptions = useMemo(() => (catalog?.plans || []).filter((p) => p.active), [catalog])
  const points = series?.points || []

  const catRows = useCallback((kind: CatalogKind): Row[] => {
    const all = (catalog?.[kind] || []) as unknown as Row[]
    if (kind === 'videos' && workspace) return all.filter((r) => String(r.lang || 'ko') === workspace)
    return all
  }, [catalog, workspace])

  const openNew = (kind: CatalogKind) => {
    setEditKind(kind); setEditingNew(true)
    const base = initialValues(FIELDS[kind])
    if (kind === 'videos' && workspace) base.lang = workspace
    setEditValues(base)
  }
  const openEdit = (kind: CatalogKind, item: Row) => {
    setEditKind(kind); setEditingNew(false); setEditValues(initialValues(FIELDS[kind], item))
  }
  const closeEdit = () => { setEditKind(null); setEditValues({}) }

  const saveEdit = async () => {
    if (!editKind) return
    const data: Row = {}
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

  const goCatalog = (tab: SettingsTab, search: string) => {
    setSection('settings'); setSettingsTab(tab)
    setTimeout(() => { setCatSearch(search); setCatPage(1) }, 0)
  }

  const hits = useMemo<SearchHit[]>(() => {
    const ql = gq.trim().toLowerCase()
    if (!ql || !catalog) return []
    const out: SearchHit[] = []
    const push = (tab: SettingsTab, group: string, rows: Row[], nameKey: string) => {
      for (const r of rows) {
        if (out.filter((h) => h.group === group).length >= 3) break
        const label = String(r[nameKey] ?? r.id ?? '')
        if (!label.toLowerCase().includes(ql) && !String(r.id ?? '').toLowerCase().includes(ql)) continue
        out.push({ id: `${tab}:${r.id}`, group, label, hint: String(r.id ?? ''), run: () => goCatalog(tab, label) })
      }
    }
    push('videos', 'Video', catalog.videos as unknown as Row[], 'title')
    push('quests', 'Nhiệm vụ', catalog.quests as unknown as Row[], 'title')
    push('shop', 'Vật phẩm', catalog.shop as unknown as Row[], 'name')
    push('plans', 'Gói', catalog.plans as unknown as Row[], 'name')
    return out
  }, [gq, catalog])

  const submitQuery = () => {
    setSection('users'); setQInput(gq); setQ(gq); setPage(1)
  }

  const userPageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const plusCell = (u: AdminUser) => {
    if (u.isPlus) {
      if (!u.plusUntil) return <span className="adm-tag plus">Vĩnh viễn</span>
      const d = daysLeft(u.plusUntil)
      return (
        <span className={'adm-tag plus' + (d !== null && d <= 7 ? ' warn' : '')} title={planStatus(u)}>
          {d !== null && d > 0 ? `Còn ${d} ngày` : 'Hết hôm nay'}
        </span>
      )
    }
    if (u.plusUntil) return <span className="adm-tag" title={planStatus(u)}>Hết {formatDate(u.plusUntil)}</span>
    return <span className="adm-dim">Miễn phí</span>
  }

  const userCols: Col<AdminUser>[] = [
    {
      k: 'name', label: 'Người dùng', sortable: true, wide: true,
      render: (u) => (
        <div className="adm-cell-user">
          <b>{u.name}</b>
          <small>{u.email || u.phone || '—'}</small>
        </div>
      ),
    },
    { k: 'role', label: 'Vai trò', render: (u) => (u.role === 'admin' ? <span className="adm-tag accent">Admin</span> : <span className="adm-dim">Người dùng</span>) },
    { k: 'plus', label: 'Gói', render: plusCell },
    { k: 'coins', label: 'Xu', sortable: true, align: 'right', render: (u) => fmtInt(u.coins) },
    { k: 'xp', label: 'XP', sortable: true, align: 'right', render: (u) => fmtInt(u.xp) },
    { k: 'streak', label: 'Chuỗi', sortable: true, align: 'right', render: (u) => fmtInt(u.streak) },
    { k: 'createdAt', label: 'Tham gia', sortable: true, render: (u) => <span className="adm-dim">{formatDate(u.createdAt)}</span> },
    { k: 'lastActive', label: 'Gần đây', sortable: true, render: (u) => <span className="adm-dim">{u.lastActive ? formatDate(u.lastActive) : '—'}</span> },
    { k: 'status', label: 'Trạng thái', render: (u) => (u.status === 'active' ? <span className="adm-tag ok">Hoạt động</span> : <span className="adm-tag off">Đã khoá</span>) },
    {
      k: 'act', label: '', align: 'right',
      render: (u) => (
        <div className="adm-rowacts">
          <button type="button" onClick={() => { setGiftUser(u); setGiftAmount(100); setGiftMsg('') }} title="Tặng xu"><Icon name="gift" size={15} /></button>
          <button type="button" onClick={() => openEditUser(u)} title="Sửa"><Icon name="note" size={15} /></button>
          {u.role !== 'admin' && <button type="button" onClick={() => removeUser(u)} title="Xoá"><Icon name="trash" size={15} /></button>}
        </div>
      ),
    },
  ]

  const dayCols: Col<Record<string, number | string>>[] = [
    { k: 'd', label: 'Ngày', sortable: true, render: (r) => fmtDayLong(String(r.d)), sortVal: (r) => String(r.d) },
    ...ALL_METRICS.map((m) => ({
      k: m, label: METRIC_SHORT[m], sortable: true, align: 'right' as const,
      render: (r: Record<string, number | string>) => fmtInt(Number(r[m])),
      sortVal: (r: Record<string, number | string>) => Number(r[m]),
    })),
  ]

  const daySorted = useSort(points as unknown as Record<string, number | string>[], dayCols, 'd', 'desc')
  const [dayPage, setDayPage] = useState(1)
  useEffect(() => { setDayPage(1) }, [days])
  const dayPaged = paginate(daySorted.sorted, dayPage, 15)

  const recentCols: Col<AdminUser>[] = [
    {
      k: 'name', label: 'Người dùng', wide: true,
      render: (u) => (
        <div className="adm-cell-user">
          <b>{u.name}</b>
          <small>{u.email || u.phone || '—'}</small>
        </div>
      ),
    },
    { k: 'plus', label: 'Gói', render: plusCell },
    { k: 'xp', label: 'XP', align: 'right', render: (u) => fmtInt(u.xp) },
    { k: 'createdAt', label: 'Tham gia', render: (u) => <span className="adm-dim">{formatDate(u.createdAt)}</span> },
  ]

  const kpiHint = `so với ${RANGE_LABEL[days].toLowerCase()} trước đó`

  const catalogPanel = (kind: CatalogKind) => {
    const rows = catRows(kind)
    const ql = catSearch.trim().toLowerCase()
    const fcfg = CAT_FILTERS[kind]
    const filterOpts = fcfg
      ? Array.from(new Set(rows.map((r) => String(r[fcfg.k] ?? '')).filter(Boolean))).sort()
      : []

    let shown = rows
    if (ql) shown = shown.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(ql)))
    if (catActive !== 'all') shown = shown.filter((r) => (catActive === 'on' ? !!r.active : !r.active))
    if (fcfg && catFilter) shown = shown.filter((r) => String(r[fcfg.k] ?? '') === catFilter)

    const cols: Col<Row>[] = [
      ...CAT_COLS[kind].map((c) => ({
        k: c.k, label: c.label, sortable: true, align: c.num ? ('right' as const) : undefined,
        wide: c.k === 'title' || c.k === 'name',
        render: (r: Row) => <span title={String(r[c.k] ?? '')}>{String(r[c.k] ?? '—')}</span>,
        sortVal: (r: Row) => (c.num ? Number(r[c.k] ?? 0) : String(r[c.k] ?? '')),
      })),
      {
        k: 'active', label: 'Bật', align: 'center',
        render: (r: Row) => (r.active ? <span className="adm-tag ok">Bật</span> : <span className="adm-tag off">Tắt</span>),
      },
      {
        k: 'act', label: '', align: 'right',
        render: (r: Row) => (
          <div className="adm-rowacts">
            <button type="button" onClick={() => openEdit(kind, r)} title="Sửa"><Icon name="note" size={15} /></button>
            <button type="button" onClick={() => remove(kind, String(r.id))} title="Xoá"><Icon name="trash" size={15} /></button>
          </div>
        ),
      },
    ]

    return <CatalogPanel
      kind={kind} cols={cols} shown={shown} totalRows={rows.length}
      catSearch={catSearch} setCatSearch={setCatSearch}
      catActive={catActive} setCatActive={setCatActive}
      catFilter={catFilter} setCatFilter={setCatFilter}
      filterOpts={filterOpts} fcfg={fcfg}
      catPage={catPage} setCatPage={setCatPage}
      onNew={() => openNew(kind)}
    />
  }

  return (
    <AdminShell
      section={section} onSection={setSection}
      settingsTab={settingsTab} onSettingsTab={setSettingsTab}
      badges={{ feedback: stats?.feedbackNew || 0 }}
      workspace={workspace} onWorkspace={setWorkspace}
      query={gq} onQuery={setGq} hits={hits} onSubmitQuery={submitQuery}
    >
      {flash && <div className="adm-flash" role="status">{flash}</div>}

      {section === 'overview' && (
        <>
          <PageHead
            title="Tổng quan"
            sub={series ? `Dữ liệu từ ${fmtDayLong(series.from)} đến ${fmtDayLong(series.to)}` : 'Đang tải số liệu…'}
          />

          <div className="adm-kpis">
            {KPI_METRICS.map((m) => (
              <KpiCard
                key={m}
                label={METRIC_LABEL[m]}
                kpi={series?.kpi[m]}
                hint={kpiHint}
                active={metric === m}
                onClick={() => setMetric(m)}
              />
            ))}
          </div>

          <section className="adm-card">
            <div className="adm-card-head">
              <div>
                <h2>{METRIC_LABEL[metric]}</h2>
                <p>Theo ngày — bấm một thẻ chỉ số phía trên để đổi đường biểu diễn.</p>
              </div>
              <div className="adm-seg" role="group" aria-label="Khoảng thời gian">
                {RANGES.map((d) => (
                  <button key={d} type="button" className={days === d ? 'on' : ''} aria-pressed={days === d} onClick={() => setDays(d)}>
                    {RANGE_SHORT[d]}
                  </button>
                ))}
              </div>
            </div>
            <TrendChart points={points} metric={metric} />
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <div>
                <h2>Người dùng mới nhất</h2>
                <p>{fmtInt(total)} tài khoản trong hệ thống.</p>
              </div>
              <button type="button" className="adm-btn" onClick={() => setSection('users')}>
                Xem tất cả <Icon name="arrow-right" size={14} />
              </button>
            </div>
            <DataTable
              cols={recentCols}
              rows={users.slice(0, 8)}
              rowKey={(u) => u.id}
              rowClass={(u) => (u.status === 'active' ? '' : 'off')}
              empty="Chưa có người dùng nào."
              maxHeight={420}
            />
          </section>
        </>
      )}

      {section === 'reports' && (
        <>
          <PageHead title="Báo cáo" sub={`Chi tiết ${RANGE_LABEL[days].toLowerCase()} gần nhất theo từng chỉ số.`} />

          <div className="adm-toolbar">
            <div className="adm-seg" role="group" aria-label="Khoảng thời gian">
              {RANGES.map((d) => (
                <button key={d} type="button" className={days === d ? 'on' : ''} aria-pressed={days === d} onClick={() => setDays(d)}>
                  {RANGE_LABEL[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="adm-metrics">
            {ALL_METRICS.map((m) => (
              <button
                key={m} type="button"
                className={'adm-metric' + (metric === m ? ' on' : '')}
                onClick={() => setMetric(m)} aria-pressed={metric === m}
              >
                <span className="adm-kpi-label">{METRIC_LABEL[m]}</span>
                <div className="adm-kpi-row">
                  <b>{series ? fmtInt(series.kpi[m].value) : '—'}</b>
                  <DeltaChip kpi={series?.kpi[m]} />
                </div>
                <Sparkline points={points} metric={m} />
              </button>
            ))}
          </div>

          <section className="adm-card">
            <div className="adm-card-head">
              <div><h2>{METRIC_LABEL[metric]}</h2><p>Đường biểu diễn theo ngày.</p></div>
            </div>
            <TrendChart points={points} metric={metric} />
          </section>

          <div className="adm-split">
            <MixCard title="Phân bổ gói" items={series?.mix.plan} />
            <MixCard title="Kênh đăng ký mới" items={series?.mix.provider} empty="Chưa có đăng ký mới trong kỳ." />
            <MixCard title="Video theo ngôn ngữ" items={series?.mix.videoLang} labelOf={(k) => studyLang(k).name} />
            <MixCard title="Phản hồi theo trạng thái" items={series?.mix.feedback} labelOf={(k) => FB_LABEL[k] || k} empty="Chưa có phản hồi." />
          </div>

          <section className="adm-card">
            <div className="adm-card-head">
              <div><h2>Chi tiết theo ngày</h2><p>Bấm tiêu đề cột để sắp xếp.</p></div>
            </div>
            <DataTable
              cols={dayCols}
              rows={dayPaged.slice}
              rowKey={(r) => String(r.d)}
              sort={daySorted.sort}
              onSort={daySorted.toggle}
              empty="Chưa có dữ liệu hoạt động."
            />
            <Pager page={dayPaged.cur} pageCount={dayPaged.pageCount} total={points.length} unit="ngày" onPage={setDayPage} />
          </section>
        </>
      )}

      {section === 'users' && (
        <>
          <PageHead title="Người dùng" sub={`${fmtInt(total)} tài khoản khớp bộ lọc hiện tại.`} />

          <section className="adm-card">
            <div className="adm-filters">
              <div className="adm-inline-search">
                <Icon name="search" size={15} />
                <input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setQ(qInput); setPage(1) } }}
                  placeholder="Tìm theo tên, email hoặc SĐT…"
                  aria-label="Tìm người dùng"
                />
              </div>
              <select aria-label="Lọc theo vai trò" value={fRole} onChange={(e) => { setFRole(e.target.value); setPage(1) }}>
                <option value="">Mọi vai trò</option>
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <select aria-label="Lọc theo trạng thái" value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1) }}>
                <option value="">Mọi trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đã khoá</option>
              </select>
              <select aria-label="Lọc theo gói" value={fPlus} onChange={(e) => { setFPlus(e.target.value); setPage(1) }}>
                <option value="">Mọi gói</option>
                <option value="plus">Đang Plus</option>
                <option value="free">Miễn phí</option>
              </select>
              <button type="button" className="adm-btn primary" onClick={() => { setQ(qInput); setPage(1) }}>Lọc</button>
            </div>

            <DataTable
              cols={userCols}
              rows={users}
              rowKey={(u) => u.id}
              sort={uSort}
              onSort={(k) => {
                if (!USER_SORT[k]) return
                setUSort((s) => (s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'asc' }))
                setPage(1)
              }}
              rowClass={(u) => (u.status === 'active' ? '' : 'off')}
              empty="Không có người dùng nào khớp bộ lọc."
              maxHeight={620}
            />
            <Pager page={page} pageCount={userPageCount} total={total} unit="người dùng" onPage={setPage} />
          </section>
        </>
      )}

      {section === 'settings' && (
        <>
          <PageHead
            title={SETTINGS_TABS.find((t) => t.id === settingsTab)?.label || 'Cài đặt'}
            sub={
              settingsTab === 'videos' && workspace
                ? `Đang lọc theo không gian ${studyLang(workspace).name}.`
                : 'Quản lý nội dung hiển thị cho học viên.'
            }
          />

          <div className="adm-tabs" role="tablist" aria-label="Nhóm cài đặt">
            {SETTINGS_TABS.map((t) => (
              <button
                key={t.id} type="button" role="tab" aria-selected={settingsTab === t.id}
                className={settingsTab === t.id ? 'on' : ''}
                onClick={() => setSettingsTab(t.id)}
              >
                {t.label}
                {t.id === 'feedback' && !!stats?.feedbackNew && <em>{stats.feedbackNew}</em>}
              </button>
            ))}
          </div>

          {settingsTab === 'videos' && catalog && catalogPanel('videos')}
          {settingsTab === 'quests' && catalog && catalogPanel('quests')}
          {settingsTab === 'shop' && catalog && catalogPanel('shop')}
          {settingsTab === 'plans' && catalog && catalogPanel('plans')}

          {settingsTab === 'feedback' && (
            <section className="adm-card">
              <div className="adm-filters">
                <b>{fmtInt(fbTotal)} phản hồi</b>
                <select aria-label="Lọc góp ý theo trạng thái" value={fbStatus} onChange={(e) => { setFbStatus(e.target.value); setFbPage(1) }}>
                  <option value="">Tất cả trạng thái</option>
                  <option value="new">Mới</option>
                  <option value="seen">Đã xem</option>
                  <option value="done">Đã xử lý</option>
                </select>
              </div>
              <DataTable
                cols={[
                  { k: 'kind', label: 'Loại', render: (f: AdminFeedback) => (f.kind === 'bug' ? <span className="adm-tag warn">Lỗi</span> : <span className="adm-tag accent">Góp ý</span>) },
                  { k: 'message', label: 'Nội dung', wide: true, render: (f: AdminFeedback) => <span className="adm-wrap">{f.message}</span> },
                  { k: 'name', label: 'Người gửi', render: (f: AdminFeedback) => f.name || <span className="adm-dim">Khách</span> },
                  { k: 'page', label: 'Trang', render: (f: AdminFeedback) => <span className="adm-dim">{f.page}</span> },
                  { k: 'createdAt', label: 'Lúc', render: (f: AdminFeedback) => <span className="adm-dim">{formatDate(f.createdAt)}</span> },
                  {
                    k: 'status', label: 'Trạng thái',
                    render: (f: AdminFeedback) => (
                      <select
                        aria-label="Đổi trạng thái góp ý" value={f.status}
                        onChange={(e) => setFeedbackStatus(f.id, e.target.value).then(() => { loadFeedback(); loadStats() }).catch(() => {})}
                      >
                        <option value="new">Mới</option>
                        <option value="seen">Đã xem</option>
                        <option value="done">Đã xử lý</option>
                      </select>
                    ),
                  },
                  {
                    k: 'act', label: '', align: 'right',
                    render: (f: AdminFeedback) => (
                      <div className="adm-rowacts">
                        <button
                          type="button" title="Xoá"
                          onClick={() => deleteFeedback(f.id).then(() => { loadFeedback(); loadStats(); showFlash('Đã xoá phản hồi.') }).catch(() => {})}
                        ><Icon name="trash" size={15} /></button>
                      </div>
                    ),
                  },
                ]}
                rows={fb}
                rowKey={(f) => String(f.id)}
                empty="Chưa có phản hồi nào."
                maxHeight={560}
              />
              <Pager
                page={fbPage} pageCount={Math.max(1, Math.ceil(fbTotal / PAGE_SIZE))}
                total={fbTotal} unit="phản hồi" onPage={setFbPage}
              />
            </section>
          )}

          {settingsTab === 'audit' && (
            <section className="adm-card">
              <div className="adm-filters">
                <b>{fmtInt(auditTotal)} thao tác đã ghi</b>
                <select aria-label="Lọc nhật ký theo loại thao tác" value={auditAction} onChange={(e) => { setAuditAction(e.target.value); setAuditPage(1) }}>
                  <option value="">Tất cả loại thao tác</option>
                  {auditActions.map((a) => <option key={a} value={a}>{AUDIT_LABEL[a] || a}</option>)}
                </select>
                <span className="adm-note">Giữ 2000 dòng gần nhất — dùng để truy lại ai đã đổi gì khi có sự cố.</span>
              </div>
              <DataTable
                cols={[
                  { k: 'created_at', label: 'Lúc', render: (a: AuditEntry) => <span className="adm-dim">{formatDate(a.created_at)}</span> },
                  { k: 'admin', label: 'Người làm', render: (a: AuditEntry) => a.admin_name || a.admin_id },
                  { k: 'action', label: 'Thao tác', render: (a: AuditEntry) => AUDIT_LABEL[a.action] || a.action },
                  { k: 'target', label: 'Đối tượng', render: (a: AuditEntry) => <span className="adm-wrap">{a.target}</span> },
                  { k: 'detail', label: 'Chi tiết', wide: true, render: (a: AuditEntry) => <span className="adm-wrap adm-dim">{a.detail}</span> },
                  { k: 'ip', label: 'IP', render: (a: AuditEntry) => <span className="adm-dim">{a.ip}</span> },
                ]}
                rows={audit}
                rowKey={(a) => String(a.id)}
                empty="Chưa có thao tác nào được ghi."
                maxHeight={560}
              />
              <Pager
                page={auditPage} pageCount={Math.max(1, Math.ceil(auditTotal / PAGE_SIZE))}
                total={auditTotal} unit="thao tác" onPage={setAuditPage}
              />
            </section>
          )}
        </>
      )}

      {editKind && (
        <CatalogModal
          kind={editKind} isNew={editingNew} values={editValues}
          onChange={setEditValues} onClose={closeEdit} onSave={saveEdit}
        />
      )}

      {editUser && (
        <UserModal
          user={editUser} onChange={setEditUser}
          plusMode={editPlusMode} onPlusMode={setEditPlusMode}
          plusUntil={editPlusUntil} onPlusUntil={setEditPlusUntil}
          plans={planOptions}
          onClose={() => setEditUser(null)} onSave={saveUser}
        />
      )}

      {giftUser && (
        <GiftModal
          user={giftUser} amount={giftAmount} onAmount={setGiftAmount}
          message={giftMsg} onMessage={setGiftMsg}
          onClose={() => setGiftUser(null)} onSend={sendGift}
        />
      )}
    </AdminShell>
  )
}

function PageHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="adm-pagehead">
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  )
}

function MixCard({
  title, items, labelOf, empty = 'Chưa có dữ liệu.',
}: { title: string; items?: { k: string; v: number }[]; labelOf?: (k: string) => string; empty?: string }) {
  const rows = items || []
  const max = Math.max(1, ...rows.map((r) => r.v))
  return (
    <section className="adm-card mix">
      <h2>{title}</h2>
      {rows.length === 0 && <p className="adm-note">{empty}</p>}
      {rows.map((r) => (
        <div key={r.k} className="adm-mixrow">
          <span>{labelOf ? labelOf(r.k) : r.k}</span>
          <div className="adm-bar"><i style={{ width: `${(r.v / max) * 100}%` }} /></div>
          <b>{fmtInt(r.v)}</b>
        </div>
      ))}
    </section>
  )
}

interface CatalogPanelProps {
  kind: CatalogKind
  cols: Col<Row>[]
  shown: Row[]
  totalRows: number
  catSearch: string
  setCatSearch: (v: string) => void
  catActive: string
  setCatActive: (v: string) => void
  catFilter: string
  setCatFilter: (v: string) => void
  filterOpts: string[]
  fcfg: { k: string; label: string } | null
  catPage: number
  setCatPage: (n: number) => void
  onNew: () => void
}

function CatalogPanel({
  kind, cols, shown, totalRows, catSearch, setCatSearch, catActive, setCatActive,
  catFilter, setCatFilter, filterOpts, fcfg, catPage, setCatPage, onNew,
}: CatalogPanelProps) {
  const { sort, toggle, sorted } = useSort(shown, cols, 'id', 'asc')
  const paged = paginate(sorted, catPage, CAT_PAGE_SIZE)

  return (
    <section className="adm-card">
      <div className="adm-filters">
        <div className="adm-inline-search">
          <Icon name="search" size={15} />
          <input
            value={catSearch}
            onChange={(e) => { setCatSearch(e.target.value); setCatPage(1) }}
            placeholder={`Tìm ${KIND_LABEL[kind]}…`}
            aria-label={`Tìm ${KIND_LABEL[kind]}`}
          />
        </div>
        {fcfg && (
          <select aria-label="Lọc theo phân loại" value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setCatPage(1) }}>
            <option value="">Mọi {fcfg.label}</option>
            {filterOpts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <select aria-label="Lọc theo trạng thái bật/tắt" value={catActive} onChange={(e) => { setCatActive(e.target.value); setCatPage(1) }}>
          <option value="all">Mọi trạng thái</option>
          <option value="on">Đang bật</option>
          <option value="off">Đang tắt</option>
        </select>
        <span className="adm-note">{shown.length}/{totalRows}</span>
        <button type="button" className="adm-btn primary" onClick={onNew}><Icon name="plus" size={14} /> Thêm</button>
      </div>

      <DataTable
        cols={cols}
        rows={paged.slice}
        rowKey={(r) => String(r.id)}
        sort={sort}
        onSort={toggle}
        rowClass={(r) => (r.active ? '' : 'off')}
        empty={`Không có ${KIND_LABEL[kind]} nào khớp bộ lọc.`}
        maxHeight={560}
      />
      <Pager page={paged.cur} pageCount={paged.pageCount} total={shown.length} unit="mục" onPage={setCatPage} />
    </section>
  )
}
