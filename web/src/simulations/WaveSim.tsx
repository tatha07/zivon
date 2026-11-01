// Wave rig — the interactive lesson block for wave/sound courses.
// Sliders set amplitude, wavelength, and speed; the profile animates along the
// x-axis; readout shows v = fλ with frequency and period. Static under
// prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react'

const W = 360
const H = 210
const AXIS = 105

export default function WaveSim() {
  const [amp, setAmp] = useState(36) // px
  const [wavelength, setWavelength] = useState(120) // px "units"
  const [speed, setSpeed] = useState(65) // px/s
  const [paused, setPaused] = useState(false)
  const phaseRef = useRef(0)
  const svgPathRef = useRef<SVGPathElement | null>(null)
  const crestRef = useRef<SVGCircleElement | null>(null)
  const particleVLineRef = useRef<SVGLineElement | null>(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let mounted = true
    let last = performance.now()
    let raf = 0
    const draw = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduced && !paused) {
        phaseRef.current += (speed / wavelength) * 2 * Math.PI * dt
      }
      const k = (2 * Math.PI) / wavelength
      let d = `M 12 ${AXIS}`
      for (let x = 12; x <= W - 12; x += 3) {
        const y = AXIS - amp * Math.sin(k * (x - 12) - phaseRef.current)
        d += ` L ${x} ${y.toFixed(1)}`
      }
      svgPathRef.current?.setAttribute('d', d)
      
      // Tracked medium particle at fixed x = 80 px
      const px = 80
      const py = AXIS - amp * Math.sin(k * (px - 12) - phaseRef.current)
      crestRef.current?.setAttribute('cx', String(px))
      crestRef.current?.setAttribute('cy', String(py.toFixed(1)))
      
      // Vertical dash showing the particle only moves vertically
      particleVLineRef.current?.setAttribute('y1', String(AXIS - amp))
      particleVLineRef.current?.setAttribute('y2', String(AXIS + amp))

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      mounted = false
      cancelAnimationFrame(raf)
    }
  }, [amp, wavelength, speed, paused, reduced])

  const freq = speed / wavelength // cycles/s
  const period = freq > 0 ? 1 / freq : 0

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · Transverse wave motion
        </p>
        <div className="flex items-center gap-3 font-notes text-sm text-ink">
          <span className="font-bold text-pen-blue">v = fλ</span>
          <span>f ≈ {freq.toFixed(2)} Hz</span>
          <span className="text-graphite">T ≈ {period.toFixed(2)} s</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label={`Travelling transverse wave. Amplitude ${amp}, wavelength ${wavelength}, speed ${speed}. Frequency ${freq.toFixed(2)} Hz.`}
      >
        {/* Equilibrium axis line */}
        <line x1="12" y1={AXIS} x2={W - 12} y2={AXIS} stroke="var(--graphite)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
        <text x={W - 10} y={AXIS + 14} fontSize="11" fill="var(--graphite)" fontFamily="var(--notes)" textAnchor="end">
          Position x →
        </text>

        {/* Displacement axis y */}
        <line x1="28" y1="20" x2="28" y2={H - 25} stroke="var(--graphite)" strokeWidth="1.5" />
        <polygon points="28,14 25,22 31,22" fill="var(--graphite)" />
        <text x="34" y="24" fontSize="11" fill="var(--graphite)" fontFamily="var(--notes)">
          y
        </text>

        {/* Amplitude bracket & notation */}
        <g stroke="var(--pen-blue)" strokeWidth="1.5">
          <line x1="45" y1={AXIS} x2="45" y2={AXIS - amp} />
          <line x1="41" y1={AXIS} x2="49" y2={AXIS} />
          <line x1="41" y1={AXIS - amp} x2="49" y2={AXIS - amp} />
        </g>
        <text x="52" y={AXIS - amp / 2 + 4} fontSize="12" fill="var(--pen-blue)" fontFamily="var(--hand)" fontWeight="bold">
          A (amplitude)
        </text>

        {/* Wavelength measurement bracket at bottom */}
        <g stroke="var(--pen-blue)" strokeWidth="1.5">
          <line x1="120" y1={H - 32} x2={120 + wavelength} y2={H - 32} />
          <line x1="120" y1={H - 38} x2="120" y2={H - 26} />
          <line x1={120 + wavelength} y1={H - 38} x2={120 + wavelength} y2={H - 26} />
        </g>
        <text
          x={120 + wavelength / 2}
          y={H - 18}
          textAnchor="middle"
          fontSize="12"
          fill="var(--pen-blue)"
          fontFamily="var(--notes)"
          fontWeight="bold"
        >
          Wavelength λ = {wavelength} units
        </text>

        {/* Continuous Waveform path */}
        <path ref={svgPathRef} d="" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Particle vertical oscillation track */}
        <line
          ref={particleVLineRef}
          x1="80"
          y1={AXIS - amp}
          x2="80"
          y2={AXIS + amp}
          stroke="var(--graphite)"
          strokeWidth="1.5"
          strokeDasharray="2 3"
          opacity="0.7"
        />

        {/* Tracked medium particle (blue dot oscillating vertically) */}
        <circle ref={crestRef} cx="80" cy={AXIS} r="6.5" fill="var(--pen-blue)" stroke="var(--ink)" strokeWidth="1.5" />

        {/* Wave propagation velocity indicator */}
        <g stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
          <line x1={W - 90} y1="36" x2={W - 40} y2="36" />
          <polyline points={`${W - 48},31 ${W - 40},36 ${W - 48},41`} fill="none" />
          <text x={W - 65} y="28" textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
            Wave v →
          </text>
        </g>
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Amplitude (A)</span>
            <span>{amp} px</span>
          </div>
          <input
            type="range"
            min="12"
            max="55"
            step="1"
            value={amp}
            onChange={(e) => setAmp(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Wave amplitude"
          />
        </label>
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Wavelength (λ)</span>
            <span>{wavelength}</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            step="2"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Wave wavelength"
          />
        </label>
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Speed (v)</span>
            <span>{speed} u/s</span>
          </div>
          <input
            type="range"
            min="0"
            max="160"
            step="5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Wave speed"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/15">
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          className="rounded-sm border border-ink/60 bg-paper px-3 py-1 font-notes text-xs font-bold text-ink hover:border-pen-blue hover:text-pen-blue"
        >
          {paused ? 'Play' : 'Pause'}
        </button>
        <p className="font-hand text-base text-pen-blue">
          Notice: the blue dot only oscillates up and down — matter does not move forward with the wave!
        </p>
      </div>
    </div>
  )
}
