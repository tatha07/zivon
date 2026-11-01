// Hand-drawn notebook sketches used across the site. Ink strokes on paper, square
// caps off — these look drawn into a real lab notebook with ink and blue pen.
// Referenced by Course.sketch keys. Each sketch takes an optional `className` for sizing.

import type { SketchKey } from '../content/types'

const INK = 'var(--ink)'
const PEN = 'var(--pen-blue)'
const GRAPHITE = 'var(--graphite)'
const RED = 'var(--pencil-red)'

type P = { className?: string; title?: string }

function Svg({ className, title, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
      stroke="currentColor"
    >
      {children}
    </svg>
  )
}

/** Pendulum: ceiling mount, dashed equilibrium reference, angle θ arc, rod L, bob m. */
export function PendulumSketch({ className, title = 'Hand-drawn sketch of a simple pendulum' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* Ceiling support */}
      <path d="M70 20 H170" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <g stroke={GRAPHITE} strokeWidth="1.5">
        <path d="M76 20 l-7 10 M96 20 l-7 10 M116 20 l-7 10 M136 20 l-7 10 M156 20 l-7 10" />
      </g>
      {/* Pivot mount clamp & pin */}
      <polygon points="115,20 125,20 123,26 117,26" fill={INK} stroke="none" />
      <circle cx="120" cy="24" r="2.5" fill="var(--paper-light)" stroke={INK} strokeWidth="1" />

      {/* Vertical equilibrium reference (mean position) */}
      <path d="M120 24 V125" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      <text x="122" y="132" fontSize="9" fill={GRAPHITE} fontFamily="var(--notes)">
        x = 0
      </text>

      {/* Angle θ arc */}
      <path d="M120 54 A 30 30 0 0 1 131 51" stroke={PEN} strokeWidth="1.5" />
      <text x="133" y="52" fontSize="11" fill={PEN} fontFamily="var(--hand)" fontWeight="bold">
        θ
      </text>

      {/* String at angle */}
      <path d="M120 24 L152 104" stroke={INK} strokeWidth="2" strokeLinecap="round" />

      {/* Length L indicator */}
      <path d="M112 36 l-3 2 M144 116 l-3 2" stroke={GRAPHITE} strokeWidth="1" />
      <text x="142" y="70" fontSize="11" fill={GRAPHITE} fontFamily="var(--notes)" fontWeight="bold">
        L
      </text>

      {/* Swing arc in pen-blue */}
      <path d="M88 114 C104 128 140 128 156 108" stroke={PEN} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />

      {/* Bob with hook and mass label */}
      <circle cx="152" cy="104" r="2.5" fill="none" stroke={INK} strokeWidth="1" />
      <circle cx="155" cy="116" r="12" fill="var(--paper)" stroke={INK} strokeWidth="2.5" />
      <circle cx="152" cy="113" r="3" fill="var(--paper-light)" stroke="none" />
      <text x="155" y="119" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="middle" fontWeight="bold">
        m
      </text>

      {/* Law formula note */}
      <text x="20" y="148" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        T = 2π√(L/g)
      </text>
    </Svg>
  )
}

/** Ray optics: plane mirror with silvering, incident ray, reflected ray, normal, angle arcs. */
export function RayOpticsSketch({ className, title = 'Hand-drawn sketch of reflection of light' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* Mirror surface */}
      <path d="M30 115 H210" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* Hatching for silvered backing */}
      <g stroke={GRAPHITE} strokeWidth="1.5">
        <path d="M40 115 l-6 8 M60 115 l-6 8 M80 115 l-6 8 M100 115 l-6 8 M120 115 l-6 8 M140 115 l-6 8 M160 115 l-6 8 M180 115 l-6 8 M200 115 l-6 8" />
      </g>
      <text x="212" y="128" fontSize="9" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="end">
        Mirror
      </text>

      {/* Normal line */}
      <path d="M120 115 V30" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="124" y="36" fontSize="11" fill={GRAPHITE} fontFamily="var(--notes)" fontWeight="bold">
        N
      </text>
      {/* 90 deg corner */}
      <path d="M108 115 v-10 h12" fill="none" stroke={GRAPHITE} strokeWidth="1.2" />

      {/* Incident ray with arrow pointing to O */}
      <path d="M48 42 L120 115" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="84,78 74,72 80,66" fill={INK} stroke="none" />
      <text x="36" y="38" fontSize="11" fill={INK} fontFamily="var(--notes)" fontWeight="bold">
        Incident ray
      </text>

      {/* Point of incidence O */}
      <circle cx="120" cy="115" r="3" fill={INK} stroke="none" />
      <text x="116" y="130" fontSize="11" fill={INK} fontFamily="var(--notes)" fontWeight="bold">
        O
      </text>

      {/* Reflected ray in pen-blue with arrow pointing away */}
      <path d="M120 115 L192 42" stroke={PEN} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="156,78 166,72 160,66" fill={PEN} stroke="none" />
      <text x="194" y="38" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        Reflected ray
      </text>

      {/* Angle of incidence arc θi */}
      <path d="M120 75 A 40 40 0 0 0 92 87" fill="none" stroke={INK} strokeWidth="1.5" />
      <text x="100" y="76" fontSize="12" fill={INK} fontFamily="var(--hand)" fontWeight="bold">
        θi
      </text>

      {/* Angle of reflection arc θr */}
      <path d="M120 75 A 40 40 0 0 1 148 87" fill="none" stroke={PEN} strokeWidth="1.5" />
      <text x="134" y="76" fontSize="12" fill={PEN} fontFamily="var(--hand)" fontWeight="bold">
        θr
      </text>

      {/* Law equation note */}
      <text x="20" y="150" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        ∠i = ∠r (Law of Reflection)
      </text>
    </Svg>
  )
}

/** Wave: sinusoidal wave, axis, wavelength λ bracket, amplitude A, crest/trough labels. */
export function WaveSketch({ className, title = 'Hand-drawn sketch of a transverse wave' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* Equilibrium axis line */}
      <path d="M20 80 H220" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
      <text x="222" y="84" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)">
        x
      </text>

      {/* Sinusoidal waveform */}
      <path
        d="M 22 80 C 38 35, 54 35, 70 80 C 86 125, 102 125, 118 80 C 134 35, 150 35, 166 80 C 182 125, 198 125, 214 80"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Crest label */}
      <circle cx="54" cy="46" r="3" fill={PEN} stroke="none" />
      <text x="54" y="32" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="middle">
        Crest
      </text>

      {/* Trough label */}
      <circle cx="102" cy="114" r="3" fill={PEN} stroke="none" />
      <text x="102" y="132" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="middle">
        Trough
      </text>

      {/* Amplitude arrow */}
      <path d="M150 80 V46" stroke={PEN} strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="150,46 147,53 153,53" fill={PEN} stroke="none" />
      <polygon points="150,80 147,73 153,73" fill={PEN} stroke="none" />
      <text x="156" y="66" fontSize="11" fill={PEN} fontFamily="var(--hand)" fontWeight="bold">
        A (amplitude)
      </text>

      {/* Wavelength bracket between consecutive crests (x=54 to x=150) */}
      <path d="M54 22 H150" stroke={PEN} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M54 16 V28 M150 16 V28" stroke={PEN} strokeWidth="1.5" />
      <text x="102" y="16" fontSize="12" fill={PEN} fontFamily="var(--notes)" textAnchor="middle" fontWeight="bold">
        λ (wavelength)
      </text>

      {/* Propagation speed vector */}
      <path d="M180 32 H214" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <polygon points="214,32 207,28 207,36" fill={INK} stroke="none" />
      <text x="197" y="26" fontSize="10" fill={INK} fontFamily="var(--notes)" textAnchor="middle">
        v →
      </text>

      {/* Formula note */}
      <text x="20" y="152" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        v = fλ
      </text>
    </Svg>
  )
}

/** Circuit: DC battery with polarity, switch, glowing bulb, ammeter, current direction. */
export function CircuitSketch({ className, title = 'Hand-drawn sketch of an electric circuit' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* Wire loop rectangle with component gaps */}
      {/* Top wire with bulb in center */}
      <path d="M40 35 H100 M140 35 H200" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Right wire with ammeter */}
      <path d="M200 35 V70 M200 100 V135" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom wire with switch */}
      <path d="M200 135 H145 M105 135 H40" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Left wire with battery */}
      <path d="M40 135 V98 M40 72 V35" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />

      {/* Battery on left wire */}
      <line x1="26" y1="72" x2="54" y2="72" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="84" x2="48" y2="84" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <line x1="26" y1="96" x2="54" y2="96" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <text x="14" y="75" fontSize="12" fill={INK} fontFamily="var(--notes)" fontWeight="bold">+</text>
      <text x="16" y="99" fontSize="14" fill={GRAPHITE} fontFamily="var(--notes)" fontWeight="bold">−</text>
      <text x="10" y="87" fontSize="10" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">V</text>

      {/* Bulb on top wire */}
      <circle cx="120" cy="35" r="14" fill="var(--paper-light)" stroke={INK} strokeWidth="2" />
      <path d="M112 41 L120 28 L128 41" fill="none" stroke={RED} strokeWidth="1.8" />
      {/* Glow rays */}
      <path d="M120 16 V11 M106 18 l-4 -4 M134 18 l4 -4" stroke={PEN} strokeWidth="1.5" strokeLinecap="round" />
      <text x="120" y="58" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="middle">
        Bulb (R)
      </text>

      {/* Ammeter on right wire */}
      <circle cx="200" cy="85" r="14" fill="var(--paper-light)" stroke={INK} strokeWidth="2" />
      <text x="200" y="90" fontSize="12" fill={INK} fontFamily="var(--notes)" textAnchor="middle" fontWeight="bold">
        A
      </text>

      {/* Switch on bottom wire */}
      <circle cx="105" cy="135" r="3" fill={INK} stroke="none" />
      <circle cx="145" cy="135" r="3" fill={INK} stroke="none" />
      {/* Switch blade closed */}
      <line x1="105" y1="135" x2="145" y2="135" stroke={PEN} strokeWidth="2.5" strokeLinecap="round" />
      <text x="125" y="150" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)" textAnchor="middle">
        Switch (K)
      </text>

      {/* Current arrow I */}
      <polygon points="76,32 84,35 76,38" fill={PEN} stroke="none" />
      <text x="80" y="26" fontSize="10" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        I →
      </text>

      {/* Formula note */}
      <text x="156" y="152" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        V = IR
      </text>
    </Svg>
  )
}

/** Motion: 1D track, moving particle with position x, velocity vector v, acceleration a. */
export function MotionSketch({ className, title = 'Hand-drawn sketch of 1D straight-line motion' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* 1D calibrated axis */}
      <line x1="30" y1="65" x2="210" y2="65" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Axis arrow */}
      <polygon points="214,65 206,60 206,70" fill={INK} stroke="none" />
      <text x="216" y="69" fontSize="11" fill={GRAPHITE} fontFamily="var(--notes)" fontWeight="bold">
        x
      </text>

      {/* Meter ticks */}
      {[40, 80, 120, 160, 200].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="60" x2={x} y2="70" stroke={GRAPHITE} strokeWidth="1.5" />
          <text x={x} y="82" textAnchor="middle" fontSize="9" fill={GRAPHITE} fontFamily="var(--notes)">
            {i * 10}m
          </text>
        </g>
      ))}

      {/* Origin */}
      <text x="24" y="69" fontSize="10" fill={INK} fontFamily="var(--notes)" fontWeight="bold">
        O
      </text>

      {/* Moving object at x=120 */}
      <rect x="106" y="48" width="28" height="15" rx="2" fill="var(--paper)" stroke={INK} strokeWidth="2" />
      <circle cx="112" cy="63" r="3.5" fill={INK} />
      <circle cx="128" cy="63" r="3.5" fill={INK} />

      {/* Velocity vector v */}
      <line x1="120" y1="42" x2="162" y2="42" stroke={PEN} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="162,42 154,38 154,46" fill={PEN} stroke="none" />
      <text x="144" y="34" fontSize="11" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        v →
      </text>

      {/* Acceleration vector a */}
      <line x1="120" y1="24" x2="148" y2="24" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
      <polygon points="148,24 142,21 142,27" fill={RED} stroke="none" />
      <text x="136" y="18" fontSize="10" fill={RED} fontFamily="var(--notes)">
        a
      </text>

      {/* Mini s-t graph note in corner */}
      <g transform="translate(30, 95)">
        <rect x="0" y="0" width="85" height="55" fill="var(--paper-light)" stroke={GRAPHITE} strokeWidth="1" />
        <line x1="12" y1="45" x2="75" y2="45" stroke={GRAPHITE} strokeWidth="1" />
        <line x1="12" y1="45" x2="12" y2="8" stroke={GRAPHITE} strokeWidth="1" />
        <text x="76" y="48" fontSize="8" fill={GRAPHITE} fontFamily="var(--notes)">t</text>
        <text x="6" y="10" fontSize="8" fill={GRAPHITE} fontFamily="var(--notes)">s</text>
        <path d="M 12 45 Q 40 38 70 16" fill="none" stroke={PEN} strokeWidth="1.8" />
        <text x="24" y="24" fontSize="8" fill={PEN} fontFamily="var(--hand)" fontWeight="bold">
          slope = v
        </text>
      </g>

      {/* Equations of motion note */}
      <text x="125" y="118" fontSize="10" fill={PEN} fontFamily="var(--notes)" fontWeight="bold">
        v = u + at
      </text>
      <text x="125" y="132" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)">
        s = ut + ½at²
      </text>
      <text x="125" y="146" fontSize="10" fill={GRAPHITE} fontFamily="var(--notes)">
        v² = u² + 2as
      </text>
    </Svg>
  )
}

const REGISTRY: Record<SketchKey, (p: P) => React.ReactElement> = {
  pendulum: PendulumSketch,
  ray: RayOpticsSketch,
  wave: WaveSketch,
  circuit: CircuitSketch,
  motion: MotionSketch,
}

/** Renders the sketch registered under a Course.sketch key; null for unknown/missing keys. */
export default function HandDrawnSketches({ sketch, className }: { sketch?: SketchKey; className?: string }) {
  if (!sketch) return null
  const Cmp = REGISTRY[sketch]
  if (!Cmp) return null
  return <Cmp className={className} />
}
