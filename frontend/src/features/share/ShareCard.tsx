import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { refLink } from '@/core/utils/referral'
import { fetchStats } from '@/core/api/srs.api'
import { useDialog } from '@/core/a11y'

const W = 1080
const H = 1080

interface Props {
  onClose: () => void
}

export default function ShareCard({ onClose }: Props) {
  const { learnLangName, t } = useAppStore()
  const boxRef = useDialog<HTMLDivElement>(true, onClose)
  const { account } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [words, setWords] = useState(0)
  const [copied, setCopied] = useState(false)

  const link = account ? refLink(account.id) : ''

  useEffect(() => {
    let alive = true
    fetchStats()
      .then((s) => { if (alive) setWords(s.total) })
      .catch(() => {  })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1d4ed8')
    grad.addColorStop(1, '#0f172a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    ctx.globalAlpha = 0.18
    ctx.fillStyle = '#60a5fa'
    ctx.beginPath(); ctx.arc(140, 170, 260, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(940, 930, 300, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    const center = (text: string, y: number, size: number, weight = '800', color = '#fff') => {
      ctx.fillStyle = color
      ctx.font = `${weight} ${size}px "Quicksand", "Be Vietnam Pro", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(text, W / 2, y)
    }

    center('VyLing', 130, 46, '800', '#bfdbfe')
    center('Hành trình học', 300, 58, '600', '#e2e8f0')
    center(learnLangName.toUpperCase(), 380, 76)

    const stats: [string, string][] = [
      [String(account?.streak ?? 0), 'ngày liên tiếp'],
      [String(words), 'thẻ từ đã lưu'],
      [String(account?.level ?? 1), 'cấp độ'],
    ]
    stats.forEach(([v, label], i) => {
      const x = W / 2 + (i - 1) * 320
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.font = '800 108px "Quicksand", sans-serif'
      ctx.fillText(v, x, 620)
      ctx.fillStyle = '#bfdbfe'
      ctx.font = '600 30px "Be Vietnam Pro", sans-serif'
      ctx.fillText(label, x, 672)
    })

    center(account?.name ? `— ${account.name} —` : '— Người học VyLing —', 800, 40, '600', '#e2e8f0')
    center('Học ngoại ngữ qua video bạn thích', 900, 34, '500', '#cbd5e1')

    ctx.fillStyle = '#fff'
    const bw = 420, bh = 78, bx = (W - bw) / 2, by = 940
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 39)
    ctx.fill()
    ctx.fillStyle = '#1d4ed8'
    ctx.font = '800 36px "Quicksand", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('vyling.vn', W / 2, by + 51)
  }, [account, words, learnLangName])

  const download = () => {
    const cv = canvasRef.current
    if (!cv) return
    const a = document.createElement('a')
    a.download = `vyling-${(account?.name || 'hoc-vien').toLowerCase().replace(/\s+/g, '-')}.png`
    a.href = cv.toDataURL('image/png')
    a.click()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal share-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(e) => e.stopPropagation()}>
        <div className="share-head">
          <h3 id="share-title"><Icon name="share" size={18} /> Khoe thành tích</h3>
          <button type="button" className="share-x" onClick={onClose} aria-label={t('a11y.close')}><Icon name="x" size={16} /></button>
        </div>

        <canvas ref={canvasRef} width={W} height={H} className="share-canvas" />

        <div className="share-actions">
          <button className="btn-primary" onClick={download}>
            <Icon name="download" size={15} /> Tải ảnh về
          </button>
        </div>

        {account && (
          <div className="share-ref">
            <b><Icon name="gift" size={14} /> Mời bạn học cùng</b>
            <p>
              Bạn bè đăng ký qua link này thì <b>cả hai cùng được 100 xu</b>. Xu dùng để mua hạt giống,
              vật phẩm trang trí và thú cưng trong cửa hàng.
            </p>
            <div className="share-ref-row">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              <button className="btn-ghost sm" onClick={copyLink}>
                <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? 'Đã chép' : 'Chép link'}
              </button>
            </div>
            {!!account.refCount && (
              <small className="share-ref-count">Bạn đã mời được {account.refCount} người — cảm ơn bạn!</small>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
