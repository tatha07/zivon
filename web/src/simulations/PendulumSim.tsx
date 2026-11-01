// Pendulum rig — the interactive lesson block for oscillation courses.
// Drag the bob (pointer or keyboard), release, watch it swing; sliders set length
// and gravity; readout shows period T = 2π√(L/g). Physics: small-to-mid angle
// pendulum with a touch of damping. Respects prefers-reduced-motion (static pose).

import { useEffect, useRef, useState } from 'react'

const W = 320
const H = 240
const PIVOT = { x: W / 2, y: 26 }

export default function PendulumSim() {
  const [lengthM, setLengthM] = useState(1) // metres
  const [gravity, setGravity] = useState(9.8) // m/s²
  const [theta0, setTheta0] = useState(0.5) // rad, initial amplitude
  const [, forceTick] = useState(0) // re-render while animating

  const thetaRef = useRef(0.5)
  const omegaRef = useRef(0)
  const draggingRef = useRef(false)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // pixel length scales with metres so the rod visibly changes
  const pxLen = 70 + lengthM * 60

  useEffect(() => {
    if (reduced) return
    let mounted = true
    const step = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.032, (now - lastRef.current) / 1000 || 0.016)
      lastRef.current = now
      if (!draggingRef.current) {
        // θ'' = -(g/L) sin θ  − small damping
        const alpha = -(gravity / lengthM) * Math.sin(thetaRef.current) - 0.02 * omegaRef.current
        omegaRef.current += alpha * dt
        thetaRef.current += omegaRef.current * dt
      }
      forceTick((t) => (t + 1) % 1000)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [gravity, lengthM, reduced])

  const theta = draggingRef.current ? thetaRef.current : thetaRef.current
  const bx = PIVOT.x + pxLen * Math.sin(theta)
  const by = PIVOT.y + pxLen * Math.cos(theta)
  const period = 2 * Math.PI * Math.sqrt(lengthM / gravity)

  const setFromPointer = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((clientX - rect.left) / rect.width) * W - PIVOT.x
    const y = ((clientY - rect.top) / rect.height) * H - PIVOT.y
    let t = Math.atan2(x, y)
    t = Math.max(-1.3, Math.min(1.3, t))
    thetaRef.current = t
    omegaRef.current = 0
    setTheta0(Math.abs(t))
  }

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · drag the bob
        </p>
        <p className="font-notes text-sm text-ink" aria-live="polite">
          T ≈ {period.toFixed(2)} s
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="application"
        aria-label={`Pendulum simulation. Length ${lengthM.toFixed(2)} metres, gravity ${gravity.toFixed(1)} metres per second squared, period about ${period.toFixed(2)} seconds. Use arrow keys to change length and gravity.`}
        onPointerDown={(e) => {
          draggingRef.current = true
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
          setFromPointer(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => draggingRef.current && setFromPointer(e.clientX, e.clientY)}
        onPointerUp={() => {
          draggingRef.current = false
        }}
      >
        {/* ceiling */}
        <line x1={PIVOT.x - 40} y1={PIVOT.y} x2={PIVOT.x + 40} y2={PIVOT.y} stroke="var(--ink)" strokeWidth="2.5" />
        <g stroke="var(--graphite)" strokeWidth="1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={PIVOT.x - 36 + i * 14} y1={PIVOT.y} x2={PIVOT.x - 42 + i * 14} y2={PIVOT.y - 8} />
          ))}
        </g>
        {/* equilibrium reference */}
        <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y + pxLen + 16} stroke="var(--graphite)" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.6" />
        {/* arc showing amplitude */}
        <path
          d={`M ${PIVOT.x + pxLen * Math.sin(-Math.max(theta0, 0.12))} ${PIVOT.y + pxLen * Math.cos(Math.max(theta0, 0.12))} A ${pxLen} ${pxLen} 0 0 1 ${PIVOT.x + pxLen * Math.sin(Math.max(theta0, 0.12))} ${PIVOT.y + pxLen * Math.cos(Math.max(theta0, 0.12))}`}
          stroke="var(--pen-blue)"
          strokeWidth="1.5"
          strokeDasharray="3 6"
          fill="none"
        />
        {/* rod */}
        <line x1={PIVOT.x} y1={PIVOT.y} x2={bx} y2={by} stroke="var(--ink)" strokeWidth="2" />
        {/* bob */}
        <circle cx={bx} cy={by} r="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
        <circle cx={bx - 4} cy={by - 4} r="3" fill="var(--graphite)" opacity="0.35" />
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            Length · {lengthM.toFixed(2)} m
          </span>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={lengthM}
            onChange={(e) => setLengthM(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Pendulum length in metres"
          />
        </label>
        <label className="block">
          <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            Gravity · {gravity.toFixed(1)} m/s²
          </span>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Gravitational acceleration in metres per second squared. 1.6 is the Moon, 9.8 Earth, 24.8 Jupiter."
          />
        </label>
      </div>
      <p className="mt-3 font-hand text-lg leading-tight text-pen-blue">
        mass never enters T = 2π√(L/g) — try it
      </p>
    </div>
  )
}
