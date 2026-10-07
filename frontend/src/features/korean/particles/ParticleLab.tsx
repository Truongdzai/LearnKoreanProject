import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { koreanVoiceStatus, onVoicesChanged, speakKO } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import KoText from '../numbers/KoText'
import PartQuiz from './PartQuiz'
import { FRAMES, GROUPS, KINDS, attach, buildFormRound, buildFrameRound, type GroupId, type KindId, type PItem } from './particles'
import { MASTERY, usePartProgress, type ModeId, type Result } from './progress'
import './styles.css'

const ROM_KEY = 'vyling.ko.particles.rom'

function readRom(): boolean {
  try { return localStorage.getItem(ROM_KEY) === '1' } catch { return false }
}

// Bốn cặp người Việt hay nhầm nhất, mỗi cặp hai câu đối chiếu
const CONTRASTS: { title: string; text: string; a: [string, string]; b: [string, string] }[] = [
  {
    title: '에 hay 에서?',
    text: 'Tiếng Việt đều nói "ở". 에: đi đến đâu (가다, 오다), có gì ở đâu (있다, 없다), lúc mấy giờ. 에서: nơi làm một việc gì đó, và "từ" nơi nào.',
    a: ['학교에 가요.', 'Tôi đến trường.'],
    b: ['학교에서 공부해요.', 'Tôi học ở trường.'],
  },
  {
    title: '은/는 hay 이/가?',
    text: '은/는 nêu chủ đề hoặc so sánh ("còn… thì"). 이/가 đánh dấu chủ ngữ là thông tin mới — câu trả lời cho 누가, 뭐가 — và đi với 있다, 없다.',
    a: ['저는 학생이에요.', 'Tôi là học sinh (nói về tôi).'],
    b: ['누가 왔어요? 민수가 왔어요.', 'Ai đến? Minsu đến.'],
  },
  {
    title: 'Tính từ + 이/가, động từ + 을/를',
    text: '좋다, 싫다, 필요하다, 무섭다 là tính từ nên thứ được thích, cần, sợ đi với 이/가. Đổi sang động từ 좋아하다, 싫어하다 thì mới dùng 을/를.',
    a: ['저는 커피가 좋아요.', 'Tôi thích cà phê.'],
    b: ['저는 커피를 좋아해요.', 'Tôi thích cà phê.'],
  },
  {
    title: '에게 / 한테 hay 에?',
    text: 'Cho ai, gọi cho ai: người và con vật dùng 에게 (viết) hoặc 한테 (nói). Nơi chốn, công ty, cây cối dùng 에.',
    a: ['친구한테 전화했어요.', 'Tôi gọi cho bạn.'],
    b: ['회사에 전화했어요.', 'Tôi gọi cho công ty.'],
  },
]

const SAMPLE_NOUNS = ['책', '학교', '물', '선생님', '친구']

export default function ParticleLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = usePartProgress()
  const [canHear, setCanHear] = useState(() => koreanVoiceStatus() === 'ready')
  const [showRom, setShowRom] = useState(readRom)
  const [kinds, setKinds] = useState<KindId[]>([])
  const [groups, setGroups] = useState<GroupId[]>([])
  const [quiz, setQuiz] = useState<{ mode: ModeId; items: PItem[]; title: string } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(koreanVoiceStatus() === 'ready')), [])

  const toggleRom = (on: boolean) => {
    setShowRom(on)
    try { localStorage.setItem(ROM_KEY, on ? '1' : '0') } catch {  }
  }

  const build = (mode: ModeId) => (mode === 'form' ? buildFormRound(kinds) : buildFrameRound(groups, state.weak))

  const start = (mode: ModeId) => {
    setQuiz({ mode, items: build(mode), title: mode === 'form' ? 'Gắn đúng dạng' : 'Chọn trợ từ trong câu' })
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((results: Result[], pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'ko')
    if (finishRound(quiz.mode, pct, results)) recordEvent('grammar', 1, 0, 0, 'ko')
  }, [quiz, finishRound, recordEvent])

  const romToggle = (
    <label className="hg-toggle kp-rom-toggle">
      <input type="checkbox" checked={showRom} onChange={(e) => toggleRom(e.target.checked)} />
      Hiện phiên âm Latin
    </label>
  )

  if (quiz) {
    return (
      <div className="kp-lab">
        {romToggle}
        <PartQuiz
          key={quiz.items[0].id}
          items={quiz.items}
          title={quiz.title}
          canHear={canHear}
          showRom={showRom}
          onFinish={onFinish}
          onAgain={() => setQuiz({ ...quiz, items: build(quiz.mode) })}
          onBack={back}
        />
      </div>
    )
  }

  const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const frameCount = groups.length ? FRAMES.filter((f) => groups.includes(f.group)).length : FRAMES.length

  return (
    <div className="kp-lab">
      <div className="grammar-intro">
        <Icon name="note" size={20} />
        <div>
          <b>Trợ từ — mẩu nhỏ gắn sau danh từ</b>
          <p>
            <KoText text="Tiếng Việt dựa vào trật tự từ, tiếng Hàn dựa vào trợ từ: 저는, 학교에, 밥을 cho biết từ nào là chủ đề, nơi chốn, tân ngữ. Hai việc cần luyện: gắn đúng dạng theo patchim (책은 hay 책는?) và chọn đúng trợ từ cho nghĩa (학교에 hay 학교에서?)." />
          </p>
          <div className="hg-stats">
            <span><b>{state.best.form ?? 0}%</b> gắn dạng tốt nhất</span>
            <span><b>{state.best.frame ?? 0}%</b> chọn trong câu tốt nhất</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <Attach canHear={canHear} />

      <section className="kp-contrasts" aria-labelledby="kp-contrast-h">
        <div className="section-title" id="kp-contrast-h"><span className="pin" /> Bốn cặp hay nhầm</div>
        <div className="kp-contrast-grid">
          {CONTRASTS.map((c) => (
            <article key={c.title} className="kp-contrast">
              <h3><KoText text={c.title} /></h3>
              <p><KoText text={c.text} /></p>
              <div className="kp-pair">
                {[c.a, c.b].map(([ko, vi]) => (
                  <button
                    key={ko}
                    type="button"
                    className={'kp-pair-row' + (canHear ? ' on' : '')}
                    onClick={canHear ? () => speakKO(ko, 0.85) : undefined}
                    tabIndex={canHear ? 0 : -1}
                  >
                    <span lang="ko">{ko}</span>
                    <small>{vi}</small>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="kp-practice" ref={practiceRef} aria-labelledby="kp-practice-h">
        <div className="kp-practice-head">
          <div className="section-title" id="kp-practice-h"><span className="pin" /> Luyện tập</div>
          {romToggle}
        </div>
        <div className="kp-modes">
          <div className={'kp-mode' + ((state.best.form ?? 0) >= MASTERY ? ' done' : '')}>
            <b><Icon name="letters" size={16} /> Gắn đúng dạng</b>
            <p><KoText text="Nhìn danh từ, chọn 1 trong 2 dạng: 책은 hay 책는, 물로 hay 물으로, 제가 hay 저가." /></p>
            <span className="hg-group-title">Loại trợ từ (để trống = tất cả)</span>
            <div className="kp-chips">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={'chip kp-chip' + (kinds.includes(k.id) ? ' on' : '')}
                  aria-pressed={kinds.includes(k.id)}
                  title={k.note}
                  onClick={() => setKinds((l) => toggle(l, k.id))}
                >
                  <span lang="ko">{k.label}</span>
                </button>
              ))}
            </div>
            <div className="kp-mode-foot">
              <small>{state.best.form != null ? `Tốt nhất: ${state.best.form}%` : 'Chưa luyện'} · 10 câu</small>
              <button className="btn-primary sm" onClick={() => start('form')}><Icon name="play" size={14} /> Bắt đầu</button>
            </div>
          </div>

          <div className={'kp-mode' + ((state.best.frame ?? 0) >= MASTERY ? ' done' : '')}>
            <b><Icon name="book" size={16} /> Chọn trợ từ trong câu</b>
            <p>{FRAMES.length} câu đời thường, mỗi câu chỉ một đáp án hợp nghĩa. Câu từng sai sẽ được hỏi lại nhiều hơn.</p>
            <span className="hg-group-title">Nhóm (để trống = trộn tất cả)</span>
            <div className="kp-chips">
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={'chip kp-chip' + (groups.includes(g.id) ? ' on' : '')}
                  aria-pressed={groups.includes(g.id)}
                  title={g.desc}
                  onClick={() => setGroups((l) => toggle(l, g.id))}
                >
                  <span lang="ko">{g.label}</span>
                </button>
              ))}
            </div>
            <div className="kp-mode-foot">
              <small>
                {state.best.frame != null ? `Tốt nhất: ${state.best.frame}%` : 'Chưa luyện'} · {Math.min(10, frameCount)} câu
                {state.weak.length > 0 && ` · ${state.weak.length} câu cần ôn`}
              </small>
              <button className="btn-primary sm" onClick={() => start('frame')}><Icon name="play" size={14} /> Bắt đầu</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Attach({ canHear }: { canHear: boolean }) {
  const [noun, setNoun] = useState('책')
  const clean = noun.trim()
  const valid = /^[가-힣]+$/.test(clean)
  return (
    <section className="kp-attach" aria-labelledby="kp-attach-h">
      <div className="section-title" id="kp-attach-h"><span className="pin" /> Bảng biến thể theo patchim</div>
      <div className="kp-attach-bar">
        <input
          className="hg-input kp-input"
          lang="ko"
          value={noun}
          maxLength={10}
          onChange={(e) => setNoun(e.target.value)}
          placeholder="Gõ một danh từ, ví dụ 학교"
          aria-label="Danh từ để gắn trợ từ"
        />
        <div className="kp-chips">
          {SAMPLE_NOUNS.map((s) => (
            <button key={s} type="button" className={'chip kp-chip' + (clean === s ? ' on' : '')} onClick={() => setNoun(s)}>
              <span lang="ko">{s}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="kn-table-wrap">
        <table className="kn-table kp-table">
          <thead>
            <tr><th scope="col">Trợ từ</th><th scope="col">Dùng để</th><th scope="col">Gắn vào {valid ? clean : '…'}</th><th scope="col">Quy tắc</th></tr>
          </thead>
          <tbody>
            {KINDS.map((k) => {
              const form = valid ? attach(clean, k.id) : ''
              return (
                <tr key={k.id}>
                  <td><b lang="ko" className="kp-label">{k.label}</b></td>
                  <td className="kp-role">{k.role}</td>
                  <td>
                    {form ? (
                      <button
                        type="button"
                        className={'kp-form' + (canHear ? ' on' : '')}
                        onClick={canHear ? () => speakKO(form, 0.8) : undefined}
                        tabIndex={canHear ? 0 : -1}
                      >
                        <span lang="ko">{form}</span>
                      </button>
                    ) : '—'}
                  </td>
                  <td className="kp-note"><KoText text={k.note} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!valid && clean && <p className="hg-note">Chỉ gõ chữ Hàn, không dấu cách — ví dụ 사과, 지하철.</p>}
    </section>
  )
}
