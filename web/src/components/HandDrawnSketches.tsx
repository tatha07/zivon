// Hand-drawn notebook sketches used across the site. Ink strokes on paper, square
// caps off — these should look drawn, not engineered. Referenced by Course.sketch keys.
// Each sketch takes an optional `className` for sizing.

import type { SketchKey } from '../content/types'

const INK = 'var(--ink)'
const PEN = 'var(--pen-blue)'
const GRAPHITE = 'var(--graphite)'

type P = { className?: string; title?: string }

function Svg({ className, title, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 140"
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

/** Pendulum: bob on a string from a ceiling hatch, dashed swing arc, angle mark. */
export function PendulumSketch({ className, title = 'Hand-drawn sketch of a simple pendulum' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* ceiling */}
      <path d="M60 18 H140" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66 18 l-6 8 M82 18 l-6 8 M98 18 l-6 8 M114 18 l-6 8 M130 18 l-6 8" stroke={GRAPHITE} strokeWidth="1.5" />
      {/* vertical reference (dashed) */}
      <path d="M100 18 V96" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.7" />
      {/* string at an angle */}
      <path d="M100 18 C107 42 116 62 124 84" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* bob */}
      <circle cx="126" cy="92" r="11" stroke={INK} strokeWidth="2.5" />
      <path d="M121 95 q5 3 10 0" stroke={GRAPHITE} strokeWidth="1.5" />
      {/* swing arc */}
      <path d="M74 96 C82 112 118 116 138 100" stroke={PEN} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
      {/* angle wedge */}
      <path d="M100 40 q9 3 14 10" stroke={GRAPHITE} strokeWidth="1.5" />
      {/* little length label tick */}
      <path d="M88 52 l-4 3 M88 58 l-4 3" stroke={GRAPHITE} strokeWidth="1.5" />
    </Svg>
  )
}

/** Ray optics: mirror line, incident ray with arrow, reflected ray, dashed normal. */
export function RayOpticsSketch({ className, title = 'Hand-drawn sketch of a light ray reflecting off a mirror' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* mirror */}
      <path d="M40 108 C80 106 130 109 168 107" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M48 114 l-5 6 M66 114 l-5 6 M84 115 l-5 6 M102 115 l-5 6 M120 115 l-5 6 M138 114 l-5 6 M156 114 l-5 6" stroke={GRAPHITE} strokeWidth="1.5" />
      {/* normal */}
      <path d="M104 107 V34" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="4 5" />
      {/* incident ray */}
      <path d="M36 30 C58 52 82 76 102 104" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 74 l8 12 M78 74 l13 3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* reflected ray */}
      <path d="M104 104 C124 78 146 54 168 32" stroke={PEN} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M146 52 l-12 -4 M146 52 l-3 -12" stroke={PEN} strokeWidth="2" strokeLinecap="round" />
      {/* equal-angle arcs */}
      <path d="M104 76 q-9 6 -13 16" stroke={GRAPHITE} strokeWidth="1.5" />
      <path d="M104 76 q9 6 13 16" stroke={GRAPHITE} strokeWidth="1.5" />
    </Svg>
  )
}

/** Wave: one hand-wobbled sine cresting across, amplitude arrows, axis beneath. */
export function WaveSketch({ className, title = 'Hand-drawn sketch of a transverse wave with its wavelength marked' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* axis */}
      <path d="M20 74 C70 73 130 75 182 74" stroke={GRAPHITE} strokeWidth="1.5" strokeDasharray="5 6" />
      {/* wave */}
      <path
        d="M22 74 C34 40 48 38 60 72 C72 104 86 108 98 74 C110 42 124 40 136 73 C148 104 162 106 176 74"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* wavelength measure */}
      <path d="M60 116 H98" stroke={PEN} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 110 v12 M98 110 v12" stroke={PEN} strokeWidth="1.5" />
      {/* amplitude arrow */}
      <path d="M136 73 V46" stroke={GRAPHITE} strokeWidth="1.5" />
      <path d="M136 46 l-3 7 M136 46 l3 7" stroke={GRAPHITE} strokeWidth="1.5" strokeLinecap="round" />
      {/* crest dot */}
      <circle cx="60" cy="52" r="2.5" fill={GRAPHITE} stroke="none" />
    </Svg>
  )
}

/** Circuit: battery, wires, switch, bulb — hand-drawn rectangle loop. */
export function CircuitSketch({ className, title = 'Hand-drawn sketch of a simple circuit with a battery, switch, and bulb' }: P) {
  return (
    <Svg className={className} title={title}>
      {/* loop */}
      <path d="M40 112 H160" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 34 H92 M118 34 H160" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 34 V112 M160 34 V112" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* battery on top-left gap... actually place battery symbol in left wire */}
      <path d="M33 66 H47 M38 74 H42 M33 82 H47 M38 90 H42" stroke={INK} strokeWidth="2.5" strokeLinecap="round" transform="rotate(90 40 78)" />
      {/* bulb in top gap */}
      <circle cx="105" cy="34" r="12" stroke={INK} strokeWidth="2.5" />
      <path d="M99 28 l12 12 M111 28 l-12 12" stroke={GRAPHITE} strokeWidth="1.5" />
      {/* filament glow ticks */}
      <path d="M105 16 v-5 M121 20 l3 -4 M89 20 l-3 -4" stroke={PEN} strokeWidth="1.5" strokeLinecap="round" />
      {/* switch on bottom wire, open */}
      <circle cx="86" cy="112" r="2.5" fill={INK} stroke="none" />
      <circle cx="112" cy="112" r="2.5" fill={INK} stroke="none" />
      <path d="M86 112 L108 98" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  )
}

const REGISTRY: Record<SketchKey, (p: P) => React.ReactElement> = {
  pendulum: PendulumSketch,
  ray: RayOpticsSketch,
  wave: WaveSketch,
  circuit: CircuitSketch,
}

/** Renders the sketch registered under a Course.sketch key; null for unknown/missing keys. */
export default function HandDrawnSketches({ sketch, className }: { sketch?: SketchKey; className?: string }) {
  if (!sketch) return null
  const Cmp = REGISTRY[sketch]
  if (!Cmp) return null
  return <Cmp className={className} />
}
