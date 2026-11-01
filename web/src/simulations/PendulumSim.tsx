// Pendulum rig — the interactive lesson block for oscillation courses.
// Drag the bob (pointer or keyboard), release, watch it swing; sliders set length
// and gravity; readout shows period T = 2π√(L/g). Physics: small-to-mid angle
// pendulum with a touch of damping. Respects prefers-reduced-motion (static pose).

import { useEffect, useRef, useState } from 'react'

const W = 360
const H = 270
const PIVOT = { x: W / 2, y: 34 }

export default function PendulumSim() {
  const [lengthM, setLengthM] = useState(1) // metres
  const [gravity, setGravity] = useState(9.8) // m/s²
  const [theta0, setTheta0] = useState(0.52) // rad, initial amplitude (~30 deg)
  const [, forceTick] = useState(0) // re-render while animating

  const thetaRef = useRef(0.52)
  const omegaRef = useRef(0)
  const draggingRef = useRef(false)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // pixel length scales with metres so the rod visibly changes
  const pxLen = 85 + lengthM * 58

  useEffect(() => {
    if (reduced) return
    let mounted = true
    const step = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.032, (now - lastRef.current) / 1000 || 0.016)
      lastRef.current = now
      if (!draggingRef.current) {
        // θ'' = -(g/L) sin θ − small realistic air damping
        const alpha = -(gravity / lengthM) * Math.sin(thetaRef.current) - 0.03 * omegaRef.current
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

  const theta = thetaRef.current
  const bx = PIVOT.x + pxLen * Math.sin(theta)
  const by = PIVOT.y + pxLen * Math.cos(theta)
  const period = 2 * Math.PI * Math.sqrt(lengthM / gravity)
  const freq = 1 / period
  const thetaDeg = ((theta * 180) / Math.PI).toFixed(1)

  // Tangential velocity vector for visual clarity
  const vScale = 14
  const vx = omegaRef.current * Math.cos(theta) * vScale
  const vy = -omegaRef.current * Math.sin(theta) * vScale

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

  const nudge = (dir: number) => {
    thetaRef.current = dir * 0.6
    omegaRef.current = 0
    setTheta0(0.6)
  }

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · Drag bob or adjust L, g
        </p>
        <div className="flex items-center gap-3 font-notes text-sm text-ink" aria-live="polite">
          <span className="font-bold text-pen-blue">θ = {thetaDeg}°</span>
          <span>T ≈ {period.toFixed(2)} s</span>
          <span className="text-graphite">f ≈ {freq.toFixed(2)} Hz</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="application"
        aria-label={`Pendulum simulation. Length ${lengthM.toFixed(2)} metres, gravity ${gravity.toFixed(1)} metres per second squared, period about ${period.toFixed(2)} seconds.`}
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
        {/* Rigid ceiling support beam */}
        <rect x={PIVOT.x - 70} y={PIVOT.y - 14} width={140} height={14} fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
        {/* Ceiling hatch cross-lines */}
        <g stroke="var(--graphite)" strokeWidth="1.5">
          {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((dx) => (
            <line key={dx} x1={PIVOT.x + dx} y1={PIVOT.y} x2={PIVOT.x + dx - 8} y2={PIVOT.y - 14} />
          ))}
        </g>

        {/* Pivot clamp & bearing */}
        <polygon points={`${PIVOT.x - 10},${PIVOT.y} ${PIVOT.x + 10},${PIVOT.y} ${PIVOT.x + 5},${PIVOT.y + 10} ${PIVOT.x - 5},${PIVOT.y + 10}`} fill="var(--ink)" />
        <circle cx={PIVOT.x} cy={PIVOT.y + 4} r="3.5" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="1.5" />

        {/* Equilibrium reference line (mean position, vertical) */}
        <line
          x1={PIVOT.x}
          y1={PIVOT.y + 8}
          x2={PIVOT.x}
          y2={PIVOT.y + pxLen + 22}
          stroke="var(--graphite)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <text x={PIVOT.x + 6} y={PIVOT.y + pxLen + 18} fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)">
          mean pos (x=0)
        </text>

        {/* Angle arc at pivot showing theta */}
        {Math.abs(theta) > 0.05 && (
          <g>
            <path
              d={`M ${PIVOT.x} ${PIVOT.y + 36} A 36 36 0 0 ${theta > 0 ? 1 : 0} ${PIVOT.x + 36 * Math.sin(theta)} ${PIVOT.y + 36 * Math.cos(theta)}`}
              stroke="var(--pen-blue)"
              strokeWidth="1.5"
              fill="none"
            />
            <text
              x={PIVOT.x + 44 * Math.sin(theta / 2)}
              y={PIVOT.y + 44 * Math.cos(theta / 2)}
              fontSize="12"
              fill="var(--pen-blue)"
              fontFamily="var(--hand)"
              fontWeight="bold"
              textAnchor="middle"
            >
              θ
            </text>
          </g>
        )}

        {/* Swing trajectory envelope (arc between -theta0 and +theta0) */}
        <path
          d={`M ${PIVOT.x + pxLen * Math.sin(-Math.max(theta0, 0.15))} ${PIVOT.y + pxLen * Math.cos(Math.max(theta0, 0.15))} A ${pxLen} ${pxLen} 0 0 1 ${PIVOT.x + pxLen * Math.sin(Math.max(theta0, 0.15))} ${PIVOT.y + pxLen * Math.cos(Math.max(theta0, 0.15))}`}
          stroke="var(--pen-blue)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          fill="none"
          opacity="0.5"
        />

        {/* Dimension bracket for length L */}
        <g opacity="0.65">
          <line
            x1={PIVOT.x - 22}
            y1={PIVOT.y + 6}
            x2={PIVOT.x - 22}
            y2={PIVOT.y + pxLen}
            stroke="var(--graphite)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <line x1={PIVOT.x - 26} y1={PIVOT.y + 6} x2={PIVOT.x - 18} y2={PIVOT.y + 6} stroke="var(--graphite)" strokeWidth="1" />
          <line x1={PIVOT.x - 26} y1={PIVOT.y + pxLen} x2={PIVOT.x - 18} y2={PIVOT.y + pxLen} stroke="var(--graphite)" strokeWidth="1" />
          <text
            x={PIVOT.x - 28}
            y={PIVOT.y + pxLen / 2 + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--graphite)"
            fontFamily="var(--notes)"
          >
            L
          </text>
        </g>

        {/* Inextensible string / rod */}
        <line x1={PIVOT.x} y1={PIVOT.y + 4} x2={bx} y2={by} stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Bob hanger loop */}
        <circle cx={bx} cy={by - 14} r="3" fill="none" stroke="var(--ink)" strokeWidth="1.5" />

        {/* Tangential velocity vector arrow if swinging */}
        {Math.abs(omegaRef.current) > 0.15 && (
          <g stroke="var(--pen-blue)" strokeWidth="2" strokeLinecap="round">
            <line x1={bx} y1={by} x2={bx + vx} y2={by + vy} />
            <polygon
              points={`${bx + vx},${by + vy} ${bx + vx * 0.7 - vy * 0.25},${by + vy * 0.7 + vx * 0.25} ${bx + vx * 0.7 + vy * 0.25},${by + vy * 0.7 - vx * 0.25}`}
              fill="var(--pen-blue)"
              stroke="none"
            />
            <text x={bx + vx + (vx > 0 ? 6 : -14)} y={by + vy} fontSize="11" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
              v
            </text>
          </g>
        )}

        {/* Spherical Bob with notebook shadow & highlight */}
        <circle cx={bx} cy={by} r="15" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
        {/* Inner concentric ring / mass detail */}
        <circle cx={bx} cy={by} r="11" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.4" />
        <circle cx={bx - 4} cy={by - 4} r="3.5" fill="var(--paper-light)" />
        <text x={bx} y={by + 4} fontSize="10" textAnchor="middle" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
          m
        </text>
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Length (L)</span>
            <span>{lengthM.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.2"
            step="0.05"
            value={lengthM}
            onChange={(e) => setLengthM(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Pendulum length in metres"
          />
        </label>
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Gravity (g)</span>
            <span>{gravity.toFixed(1)} m/s²</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Gravitational acceleration in m/s^2"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/15">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            className="rounded-sm border border-ink/60 bg-paper px-2.5 py-1 font-notes text-xs font-bold text-ink hover:border-pen-blue hover:text-pen-blue"
          >
            ← Swing left
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            className="rounded-sm border border-ink/60 bg-paper px-2.5 py-1 font-notes text-xs font-bold text-ink hover:border-pen-blue hover:text-pen-blue"
          >
            Swing right →
          </button>
          <button
            type="button"
            onClick={() => {
              thetaRef.current = 0
              omegaRef.current = 0
              setTheta0(0)
            }}
            className="rounded-sm border border-ink/60 bg-paper px-2.5 py-1 font-notes text-xs font-bold text-ink hover:border-pencil-red hover:text-pencil-red"
          >
            Stop
          </button>
        </div>
        <p className="font-hand text-base text-pen-blue">
          T = 2π√(L/g) · mass m never changes the period
        </p>
      </div>
    </div>
  )
}
