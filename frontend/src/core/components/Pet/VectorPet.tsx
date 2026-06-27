import { useId, type ReactNode } from 'react'
import type { PetMood } from './index'

export const VECTOR_ARTS = ['cat', 'bunny', 'pig', 'chick', 'unicorn', 'dragon', 'galaxy']

const EYE = '#3b3030'

interface Spec {
  body: [string, string]
  belly?: string
  cheek: string
  outline: string
  ear: 'cat' | 'bunny' | 'fox' | 'pig' | 'none'
  earFill?: string
  innerEar?: string
  horn?: boolean
  wings?: boolean
  snout?: boolean
  beak?: boolean
  tuft?: boolean
  eyeY?: number
  mouthY?: number
  plus?: boolean
  fx?: 'sparkle' | 'ember' | 'galaxy'
  glow?: string
  sparkleFill?: string
  speckle?: boolean
}

const SPECS: Record<string, Spec> = {
  cat: { body: ['#ffffff', '#e9ecf5'], belly: '#ffffff', cheek: '#ffb0c4', outline: '#c2c8d6', ear: 'cat', innerEar: '#ffc2cf' },
  bunny: { body: ['#fdfdff', '#e7e7f2'], belly: '#ffffff', cheek: '#ffb3c6', outline: '#cdd2df', ear: 'bunny', innerEar: '#ffc2d4' },
  pig: { body: ['#ffc8d6', '#ff9fb3'], belly: '#ffd9e0', cheek: '#ff7fa0', outline: '#e58aa3', ear: 'pig', earFill: '#ff9fb3', snout: true, mouthY: 70 },
  chick: { body: ['#ffe57a', '#f6c63b'], belly: '#fff0bf', cheek: '#ffae8f', outline: '#e6b733', ear: 'none', beak: true, tuft: true },
  unicorn: { body: ['#fdf0ff', '#ecd9f7'], belly: '#fff7fb', cheek: '#ffb0d4', outline: '#d9b8e6', ear: 'cat', innerEar: '#ffd0ea', horn: true, plus: true, fx: 'sparkle', glow: '#ffbdf0', sparkleFill: '#ffe27a' },
  dragon: { body: ['#86ecb4', '#19b87a'], belly: '#d8ffe9', cheek: '#ff9a7a', outline: '#0f9b65', ear: 'fox', earFill: '#15a86e', wings: true, plus: true, fx: 'ember', glow: '#ffb24d', sparkleFill: '#ffd36b' },
  galaxy: { body: ['#5560b0', '#241b40'], belly: '#3a3566', cheek: '#7d6fd6', outline: '#1b1533', ear: 'fox', earFill: '#33305e', plus: true, fx: 'galaxy', glow: '#8ab4ff', sparkleFill: '#cdddff', speckle: true },
}

const STAR = 'M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z'

function Spark({ x, y, s, fill, delay }: { x: number; y: number; s: number; fill: string; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="pet-spark" style={{ animationDelay: `${delay}s` }} d={STAR} fill={fill} />
    </g>
  )
}

function Ember({ x, y, r, fill, delay }: { x: number; y: number; r: number; fill: string; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="pet-ember" style={{ animationDelay: `${delay}s` }} r={r} fill={fill} />
    </g>
  )
}

function ears(s: Spec): ReactNode {
  const fill = s.earFill || s.body[0]
  if (s.ear === 'cat' || s.ear === 'fox') {
    const inner = s.ear === 'cat' ? s.innerEar : undefined
    return (
      <g>
        <path d="M31 40 L26 17 L43 34 Z" fill={fill} />
        <path d="M69 40 L74 17 L57 34 Z" fill={fill} />
        {inner && <path d="M33 36 L30 23 L40 33 Z" fill={inner} stroke="none" />}
        {inner && <path d="M67 36 L70 23 L60 33 Z" fill={inner} stroke="none" />}
      </g>
    )
  }
  if (s.ear === 'bunny') {
    return (
      <g>
        <ellipse cx="39" cy="17" rx="7" ry="20" fill={fill} />
        <ellipse cx="61" cy="17" rx="7" ry="20" fill={fill} />
        <ellipse cx="39" cy="19" rx="3" ry="13" fill={s.innerEar} stroke="none" />
        <ellipse cx="61" cy="19" rx="3" ry="13" fill={s.innerEar} stroke="none" />
      </g>
    )
  }
  if (s.ear === 'pig') {
    return (
      <g>
        <path d="M33 36 q-7 -15 6 -14 q5 6 1 17 z" fill={fill} />
        <path d="M67 36 q7 -15 -6 -14 q-5 6 -1 17 z" fill={fill} />
      </g>
    )
  }
  return null
}

function horn(): ReactNode {
  return (
    <g>
      <path d="M50 28 L46 11 L54 11 Z" fill="#ffd86b" stroke="#e3ad36" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M47.5 22 h5 M48.4 17 h3.2" stroke="#e3ad36" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
}

function wings(s: Spec): ReactNode {
  return (
    <g fill={s.body[1]} stroke={s.outline} strokeWidth="2" strokeLinejoin="round">
      <path d="M24 52 q-18 -8 -16 10 q8 10 18 2 q-8 -4 -2 -12 z" />
      <path d="M76 52 q18 -8 16 10 q-8 10 -18 2 q8 -4 2 -12 z" />
    </g>
  )
}

const openEye = (cx: number, cy: number, r = 5, look = 0): ReactNode => (
  <g key={'o' + cx}>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.18} fill={EYE} />
    <circle cx={cx + r * 0.34} cy={cy - r * 0.5 + look} r={r * 0.32} fill="#fff" />
    <circle cx={cx - r * 0.25} cy={cy + r * 0.5 + look} r={r * 0.16} fill="#fff" opacity=".7" />
  </g>
)
const wideEye = (cx: number, cy: number): ReactNode => (
  <g key={'w' + cx}>
    <ellipse cx={cx} cy={cy} rx="5.4" ry="6.6" fill="#fff" stroke={EYE} strokeWidth="1.6" />
    <circle cx={cx} cy={cy + 1.4} r="2.5" fill={EYE} />
  </g>
)
const arcEye = (cx: number, cy: number, down: boolean): ReactNode =>
  down ? (
    <path key={'a' + cx} d={`M${cx - 5} ${cy - 1} q5 5 10 0`} fill="none" stroke={EYE} strokeWidth="2.4" strokeLinecap="round" />
  ) : (
    <path key={'a' + cx} d={`M${cx - 5} ${cy + 1} q5 -5 10 0`} fill="none" stroke={EYE} strokeWidth="2.4" strokeLinecap="round" />
  )
const heartEye = (cx: number, cy: number): ReactNode => (
  <path key={'h' + cx} d={`M${cx} ${cy + 3.6} l-3.5 -3.7 a2.3 2.3 0 0 1 3.5 -3 a2.3 2.3 0 0 1 3.5 3 z`} fill="#ff5d8f" />
)

function face(s: Spec, mood: PetMood): ReactNode {
  const ey = s.eyeY ?? 51
  const my = s.mouthY ?? 64
  const lx = 42, rx = 58
  let eyes: ReactNode
  let extra: ReactNode = null
  let mouth: ReactNode

  switch (mood) {
    case 'love':
      eyes = <>{heartEye(lx, ey)}{heartEye(rx, ey)}</>
      mouth = <path d={`M46 ${my - 1} q4 6 8 0 z`} fill="#ff7a90" stroke={EYE} strokeWidth="1.3" strokeLinejoin="round" />
      extra = <>
        <path className="pet-spark" style={{ animationDelay: '0s' }} d="M26 28 a2 2 0 0 1 3 0 a2 2 0 0 1 3 0 q0 2.4 -3 4.4 q-3 -2 -3 -4.4 z" fill="#ff8fb0" />
        <path className="pet-spark" style={{ animationDelay: '.6s' }} d="M70 24 a1.7 1.7 0 0 1 2.6 0 a1.7 1.7 0 0 1 2.6 0 q0 2 -2.6 3.7 q-2.6 -1.7 -2.6 -3.7 z" fill="#ff8fb0" />
      </>
      break
    case 'wink':
      eyes = <>{arcEye(lx, ey, false)}{openEye(rx, ey)}</>
      mouth = <path d={`M45 ${my} q5 4.5 10 0`} fill="none" stroke={EYE} strokeWidth="2.2" strokeLinecap="round" />
      break
    case 'sleepy':
      eyes = <>{arcEye(lx, ey + 1, true)}{arcEye(rx, ey + 1, true)}</>
      mouth = <ellipse cx="50" cy={my + 1} rx="3" ry="3.6" fill="#ff8a9e" stroke={EYE} strokeWidth="1.2" />
      break
    case 'sleep':
      eyes = <>{arcEye(lx, ey, false)}{arcEye(rx, ey, false)}</>
      mouth = <path d={`M47 ${my} h6`} stroke={EYE} strokeWidth="2" strokeLinecap="round" />
      extra = (
        <g fill="none" stroke="#9aa6c4" strokeWidth="1.7" strokeLinecap="round" opacity=".85">
          <path className="pet-spark" style={{ animationDelay: '0s' }} d="M63 31 h5 l-5 5 h5" />
          <path className="pet-spark" style={{ animationDelay: '.7s' }} d="M71 22 h4 l-4 4 h4" />
        </g>
      )
      break
    case 'reading':
      eyes = <>{openEye(lx, ey, 5, 1.6)}{openEye(rx, ey, 5, 1.6)}</>
      mouth = <path d={`M46 ${my} q4 3.5 8 0`} fill="none" stroke={EYE} strokeWidth="2" strokeLinecap="round" />
      break
    case 'shy':
      eyes = <>{arcEye(lx, ey, false)}{arcEye(rx, ey, false)}</>
      mouth = <path d={`M47 ${my} q3 3 6 0`} fill="none" stroke={EYE} strokeWidth="2" strokeLinecap="round" />
      break
    case 'confused':
      eyes = <>{openEye(lx, ey - 1, 5)}{openEye(rx, ey + 1, 3.6)}</>
      mouth = <path d={`M45 ${my} q2.5 -3 5 0 q2.5 3 5 0`} fill="none" stroke={EYE} strokeWidth="2" strokeLinecap="round" />
      extra = (
        <g>
          <path d="M70 21 q0 -4 4 -4 q4 0 4 4 q0 3 -4 4 v2" fill="none" stroke="#f7b500" strokeWidth="2" strokeLinecap="round" />
          <circle cx="74" cy="33" r="1.3" fill="#f7b500" />
        </g>
      )
      break
    case 'scared':
      eyes = <>{wideEye(lx, ey)}{wideEye(rx, ey)}</>
      mouth = <ellipse cx="50" cy={my + 1} rx="4" ry="4.6" fill="#7a3b46" />
      extra = <path className="pet-spark" style={{ animationDelay: '0s' }} d="M31 45 q-3 5 0 8 q3 -3 0 -8 z" fill="#7fd0ff" stroke="#5bb6ef" strokeWidth=".8" />
      break
    default: // happy
      eyes = <>{openEye(lx, ey)}{openEye(rx, ey)}</>
      mouth = <path d={`M45 ${my} q5 4.5 10 0`} fill="none" stroke={EYE} strokeWidth="2.2" strokeLinecap="round" />
  }

  const big = mood === 'shy' || mood === 'love'
  const cr = big ? 6 : 4.6
  return (
    <>
      {eyes}
      <ellipse cx="33" cy={ey + 8} rx={cr} ry={cr * 0.66} fill={s.cheek} opacity=".75" />
      <ellipse cx="67" cy={ey + 8} rx={cr} ry={cr * 0.66} fill={s.cheek} opacity=".75" />
      {s.snout ? (
        <g>
          <ellipse cx="50" cy="61" rx="9" ry="6.5" fill="#ff9fb3" stroke={s.outline} strokeWidth="1.6" />
          <ellipse cx="46.5" cy="61" rx="1.6" ry="2.4" fill={EYE} />
          <ellipse cx="53.5" cy="61" rx="1.6" ry="2.4" fill={EYE} />
        </g>
      ) : s.beak ? (
        <path d="M45 56 L55 56 L50 63 Z" fill="#ff9d2e" stroke="#e07d18" strokeWidth="1" strokeLinejoin="round" />
      ) : (
        mouth
      )}
      {extra}
    </>
  )
}

interface Props {
  art: string
  size?: number
  mood?: PetMood
  className?: string
}

/** Pet vẽ vector (kawaii). Pet Plus có hào quang + lấp lánh/tàn lửa. */
export default function VectorPet({ art, size = 96, mood = 'happy', className }: Props) {
  const s = SPECS[art] || SPECS.cat
  const uid = useId().replace(/:/g, '')
  const bodyId = `b${uid}`
  const glowId = `g${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 104"
      xmlns="http://www.w3.org/2000/svg"
      className={'pet-vec' + (s.plus ? ' fx-plus' : '') + (className ? ' ' + className : '')}
      style={s.glow ? ({ ['--gl' as string]: s.glow } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.body[0]} />
          <stop offset="100%" stopColor={s.body[1]} />
        </linearGradient>
        {s.glow && (
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={s.glow} stopOpacity="0.55" />
            <stop offset="60%" stopColor={s.glow} stopOpacity="0.16" />
            <stop offset="100%" stopColor={s.glow} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {s.glow && <ellipse className="pet-aura" cx="50" cy="56" rx="46" ry="46" fill={`url(#${glowId})`} />}
      {s.wings && wings(s)}

      <g stroke={s.outline} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="38" cy="92" rx="8" ry="5" fill={s.body[1]} />
        <ellipse cx="62" cy="92" rx="8" ry="5" fill={s.body[1]} />
        {ears(s)}
        <ellipse cx="50" cy="58" rx="30" ry="31" fill={`url(#${bodyId})`} />
        {s.belly && <ellipse cx="50" cy="66" rx="18" ry="18" fill={s.belly} stroke="none" />}
        <ellipse cx="24" cy="73" rx="6" ry="8.5" fill={s.body[0]} />
        <ellipse cx="76" cy="73" rx="6" ry="8.5" fill={s.body[0]} />
        {s.tuft && <path d="M46 28 q2 -7 4 0 M50 27 q2 -7 4 0" fill="none" stroke={s.body[1]} strokeWidth="3" strokeLinecap="round" />}
      </g>

      {s.horn && horn()}
      {s.speckle && (
        <g fill="#cdddff" opacity=".9">
          <circle cx="40" cy="46" r=".9" /><circle cx="60" cy="48" r=".8" /><circle cx="46" cy="72" r=".9" />
          <circle cx="58" cy="70" r=".7" /><circle cx="36" cy="62" r=".7" /><circle cx="64" cy="60" r=".8" />
        </g>
      )}

      {face(s, mood)}

      {s.fx === 'sparkle' && (
        <g>
          <Spark x={14} y={30} s={1.5} fill={s.sparkleFill!} delay={0} />
          <Spark x={86} y={26} s={1.1} fill="#fff6c8" delay={0.5} />
          <Spark x={20} y={74} s={1} fill={s.sparkleFill!} delay={0.9} />
          <Spark x={84} y={70} s={1.4} fill="#fff6c8" delay={0.3} />
          <Spark x={50} y={6} s={1} fill={s.sparkleFill!} delay={1.1} />
        </g>
      )}
      {s.fx === 'ember' && (
        <g>
          <Ember x={34} y={84} r={2.1} fill="#ffd36b" delay={0} />
          <Ember x={50} y={88} r={2.6} fill="#ff9d3c" delay={0.8} />
          <Ember x={66} y={84} r={2} fill="#ffce5a" delay={1.5} />
          <Ember x={42} y={86} r={1.6} fill="#ffb24d" delay={2} />
        </g>
      )}
      {s.fx === 'galaxy' && (
        <g>
          <Spark x={16} y={28} s={1.2} fill={s.sparkleFill!} delay={0} />
          <Spark x={84} y={34} s={1} fill="#fff" delay={0.6} />
          <Spark x={24} y={76} s={1} fill={s.sparkleFill!} delay={1.2} />
          <Spark x={80} y={72} s={1.3} fill="#bcd2ff" delay={0.4} />
          <Spark x={50} y={5} s={1.1} fill="#fff" delay={0.9} />
        </g>
      )}
    </svg>
  )
}
