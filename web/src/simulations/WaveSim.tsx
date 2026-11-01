// Wave rig — the interactive lesson block for wave/sound/motion courses.
// Sliders set amplitude, wavelength, and speed; the profile animates along the
// x-axis; readout shows v = fλ with the implied frequency. Static under
// prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react'

const W = 320
const H = 180
const AXIS = 100

export default function WaveSim() {
  const [amp, setAmp] = useState(34) // px
  const [wavelength, setWavelength] = useState(120) // px "units"
  const [speed, setSpeed] = useState(60) // px/s
  const phaseRef = useRef(0)
  const svgPathRef = useRef<SVGPathElement | null>(null)
  const crestRef = useRef<SVGCircleElement | null>(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let mounted = true
    let last = performance.now()
    let raf = 0
    const draw = (now: number) => {
      if (!mounted) return
      const dt = (now - last) / 1000
      last = now
      if (!reduced) phaseRef.current += (speed / wavelength) * 2 * Math.PI * dt
      const k = (2 * Math.PI) / wavelength
      let d = `M 8 ${AXIS}`
      for (let x = 8; x <= W - 8; x += 4) {
        const y = AXIS - amp * Math.sin(k * (x - 8) - phaseRef.current)
        d += ` L ${x} ${y.toFixed(1)}`
      }
      svgPathRef.current?.setAttribute('d', d)
      const cx = 8 + wavelength / 4
      const cy = AXIS - amp * Math.sin(k * (cx - 8) - phaseRef.current)
      crestRef.current?.setAttribute('cx', String(cx))
      crestRef.current?.setAttribute('cy', String(cy))
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      mounted = false
      cancelAnimationFrame(raf)
    }
  }, [amp, wavelength, speed, reduced])

  const freq = speed / wavelength // cycles per unit-time
  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · move the sliders
        </p>
        <p className="font-notes text-sm text-ink">v = fλ → f ≈ {freq.toFixed(2)}</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`Travelling wave. Amplitude ${amp}, wavelength ${wavelength}, speed ${speed}. Frequency about ${freq.toFixed(2)} cycles per second.`}>
        {/* axis */}
        <line x1="8" y1={AXIS} x2={W - 8} y2={AXIS} stroke="var(--graphite)" strokeWidth="1.5" strokeDasharray="5 6" opacity="0.7" />
        {/* ticks */}
        <line x1="8" y1="14" x2="8" y2={H - 14} stroke="var(--graphite)" strokeWidth="1.5" />
        <line x1="8" y1="16" x2={W - 10} y2="16" stroke="var(--graphite)" strokeWidth="1.5" />
        {/* wave */}
        <path ref={svgPathRef} d="" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* tracked particle */}
        <circle ref={crestRef} cx={8 + wavelength / 4} cy={AXIS - amp} r="5" fill="var(--pen-blue)" />
        {/* wavelength measure between two crests */}
        <line x1="8" y1={H - 22} x2={8 + wavelength} y2={H - 22} stroke="var(--pen-blue)" strokeWidth="1.5" strokeDasharray="3 4" />
        <text x={8 + wavelength / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--graphite)" fontFamily="var(--notes)">
          λ
        </text>
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">Amplitude</span>
          <input type="range" min="8" max="60" step="1" value={amp}
            onChange={(e) => setAmp(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]" aria-label="Wave amplitude" />
        </label>
        <label className="block">
          <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">Wavelength</span>
          <input type="range" min="40" max="260" step="2" value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]" aria-label="Wave wavelength" />
        </label>
        <label className="block">
          <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">Speed</span>
          <input type="range" min="0" max="200" step="5" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]" aria-label="Wave speed" />
        </label>
      </div>
      <p className="mt-3 font-hand text-lg leading-tight text-pen-blue">
        the blue dot rides up and down — it never travels with the wave
      </p>
    </div>
  )
}
