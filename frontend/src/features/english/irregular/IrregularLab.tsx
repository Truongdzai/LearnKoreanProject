import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { GROUP_INFO, type IrregularVerb, type VerbGroup } from '@/data/english/irregularVerbs'
import { useAppStore } from '@/store/app.store'
import IrrQuiz from './IrrQuiz'
import { MASTERY, useIrrProgress, weakVerb, type Answer } from './progress'
import { MODES, ROUND, SETS, pickVerbs, sayForms, verbsOf, type ModeId, type SetId } from './verbs'
import './styles.css'

const SET_KEY = 'vyling.en.irregular.set'
const GROUPS: VerbGroup[] = ['ABC', 'ABB', 'AAA', 'ABA']

function readSet(): SetId {
  try {
    const v = localStorage.getItem(SET_KEY)
    return v === 'more' || v === 'all' ? v : 'core'
  } catch {
    return 'core'
  }
}

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

export default function IrregularLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useIrrProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [set, setSet] = useState<SetId>(readSet)
  const [group, setGroup] = useState<VerbGroup>('ABC')
  const [query, setQuery] = useState('')
  const [quiz, setQuiz] = useState<{ mode: ModeId; verbs: IrregularVerb[]; title: string; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  const pickSet = (s: SetId) => {
    setSet(s)
    try { localStorage.setItem(SET_KEY, s) } catch {  }
  }

  const list = useMemo(() => verbsOf(set), [set])
  const known = useMemo(() => new Set(state.known), [state.known])
  const knownHere = list.filter((v) => known.has(v.v1)).length
  const weakHere = new Set(state.weak.map(weakVerb).filter((v) => list.some((x) => x.v1 === v))).size

  const start = (mode: ModeId) => {
    const m = MODES.find((x) => x.id === mode)!
    setQuiz((q) => ({ mode, verbs: pickVerbs(set, state.weak, state.known), title: m.label, n: (q?.n ?? 0) + 1 }))
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((answers: Answer[], pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound(quiz.mode, pct, answers)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [quiz, finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="ei-lab">
        <IrrQuiz
          key={quiz.n}
          verbs={quiz.verbs}
          mode={quiz.mode}
          title={quiz.title}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.mode)}
          onBack={back}
        />
      </div>
    )
  }

  const q = norm(query)
  const rows = q
    ? list.filter((v) => [v.v1, ...v.v2, ...v.v3].some((f) => f.startsWith(q)) || (' ' + norm(v.vi).replace(/[^a-z0-9]+/g, ' ')).includes(' ' + q))
    : list.filter((v) => v.group === group)
  const counts = Object.fromEntries(GROUPS.map((g) => [g, list.filter((v) => v.group === g).length])) as Record<VerbGroup, number>

  return (
    <div className="ei-lab">
      <div className="grammar-intro">
        <Icon name="refresh" size={20} />
        <div>
          <b>Động từ bất quy tắc — V1 · V2 · V3</b>
          <p>
            Kể chuyện quá khứ cần V2 (I <i>went</i> home), thì hoàn thành và câu bị động cần V3 (I have <i>gone</i>,
            it was <i>written</i>). Phần lớn động từ chỉ thêm -ed, nhưng những từ dùng nhiều nhất lại bất quy tắc — học
            theo nhóm có cùng kiểu biến đổi sẽ nhanh hơn học từng từ.
          </p>
          <div className="hg-stats">
            <span><b>{knownHere}/{list.length}</b> từ đã thuộc (tự gõ đúng)</span>
            <span><b>{state.best.v2 ?? 0}%</b> V2 tốt nhất</span>
            <span><b>{state.best.v3 ?? 0}%</b> V3 tốt nhất</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <div className="ei-sets" role="group" aria-label="Bộ động từ">
        <span className="hg-group-title">Bộ động từ</span>
        <div className="ei-chips">
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={'chip ei-chip' + (set === s.id ? ' on' : '')}
              aria-pressed={set === s.id}
              onClick={() => pickSet(s.id)}
            >
              {s.label} <small>{verbsOf(s.id).length}</small>
            </button>
          ))}
        </div>
      </div>

      <section className="ei-table-sec" aria-labelledby="ei-table-h">
        <div className="ei-table-head">
          <div className="section-title" id="ei-table-h"><span className="pin" /> Bảng theo nhóm</div>
          <input
            className="hg-input ei-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm: go, went, ăn…"
            aria-label="Tìm động từ"
            lang="en"
          />
        </div>
        {!q && (
          <>
            <div className="vl-modes ei-groups" role="group" aria-label="Nhóm biến đổi">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={group === g}
                  className={'vl-mode' + (group === g ? ' on' : '')}
                  onClick={() => setGroup(g)}
                >
                  {GROUP_INFO[g].title} <small>{counts[g]}</small>
                </button>
              ))}
            </div>
            <p className="ei-group-desc">{GROUP_INFO[group].desc}</p>
          </>
        )}
        {rows.length === 0 ? (
          <p className="hg-note">Không có động từ nào khớp “{query.trim()}” trong bộ đang chọn.</p>
        ) : (
          <div className="ei-table-wrap">
            <table className="ei-table">
              <thead>
                <tr><th>V1</th><th>V2</th><th>V3</th><th>Nghĩa</th><th aria-label="Nghe" /></tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.v1} className={known.has(v.v1) ? 'known' : undefined}>
                    <td className="ei-c1" lang="en">
                      {v.v1}
                      {known.has(v.v1) && <Icon name="check-circle" size={13} />}
                    </td>
                    <td lang="en">{v.v2.join(' / ')}</td>
                    <td lang="en">{v.v3.join(' / ')}</td>
                    <td className="ei-vi-cell">
                      {v.vi}
                      {v.note && <em>{v.note}</em>}
                    </td>
                    <td className="ei-say-cell">
                      {canHear && (
                        <button className="ei-icon-btn" onClick={() => speakEN(sayForms(v), 0.8)} aria-label={`Nghe ${sayForms(v)}`}>
                          <Icon name="volume" size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ei-practice" ref={practiceRef} aria-labelledby="ei-practice-h">
        <div className="section-title" id="ei-practice-h"><span className="pin" /> Luyện tập</div>
        <div className="ei-modes">
          {MODES.map((m) => {
            const best = state.best[m.id]
            return (
              <div key={m.id} className={'ei-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')}>
                <b><Icon name={m.id === 'type' ? 'keyboard' : 'target'} size={16} /> {m.label}</b>
                <p>{m.desc}</p>
                <div className="ei-mode-foot">
                  <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · {ROUND} từ</small>
                  <button className="btn-primary sm" onClick={() => start(m.id)}><Icon name="play" size={14} /> Bắt đầu</button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="hg-note">
          Mỗi lượt lấy {ROUND} từ trong bộ “{SETS.find((s) => s.id === set)?.label}”, ưu tiên từ bạn vừa sai rồi tới từ chưa thuộc.
          {weakHere > 0 && ` Đang có ${weakHere} từ cần ôn lại trong bộ này.`}
        </p>
      </section>
    </div>
  )
}
