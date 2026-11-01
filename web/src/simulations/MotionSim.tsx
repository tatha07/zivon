// MotionSim — interactive lesson block for Motion in a Straight Line.
// Controls for initial velocity u and acceleration a; animated cart moves
// along calibrated 1D track; real-time kinematic formulas v = u + at and
// s = ut + 0.5at^2 with position-time (s-t) slope preview.

import { useEffect, useRef, useState } from 'react'

const W = 360
const H = 220
const TRACK_Y = 65
const X_MIN = 35
const X_MAX = 325
const MAX_METRES = 50 // track length in metres

export default function MotionSim() {
  const [u, setU] = useState(2) // initial velocity in m/s
  const [a, setA] = useState(1.5) // acceleration in m/s^2
  const [time, setTime] = useState(0) // seconds elapsed
  const [running, setRunning] = useState(true)

  const rafRef = useRef(0)
  const lastRef = useRef(0)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) return
    let mounted = true
    const loop = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.04, (now - lastRef.current) / 1000 || 0.016)
      lastRef.current = now
      if (running) {
        setTime((t) => {
          const next = t + dt
          const currentS = u * next + 0.5 * a * next * next
          if (currentS >= MAX_METRES || (next > 10 && currentS <= 0)) {
            return 0 // loop reset
          }
          return next
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [running, u, a, reduced])

  // Kinematic calculations
  const s = Math.max(0, Math.min(MAX_METRES, u * time + 0.5 * a * time * time))
  const v = u + a * time

  // Map metres (0..50) to pixels (X_MIN..X_MAX)
  const cartPx = X_MIN + (s / MAX_METRES) * (X_MAX - X_MIN)

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · 1D Kinematics (v = u + at)
        </p>
        <div className="flex items-center gap-3 font-notes text-sm text-ink" aria-live="polite">
          <span className="font-bold text-pen-blue">s = {s.toFixed(1)} m</span>
          <span>v = {v.toFixed(1)} m/s</span>
          <span className="text-graphite">t = {time.toFixed(2)} s</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label={`Motion simulation. Position ${s.toFixed(1)} m, velocity ${v.toFixed(1)} m/s, time ${time.toFixed(2)} s.`}
      >
        {/* 1D Calibrated Track */}
        <line x1={X_MIN - 10} y1={TRACK_Y} x2={X_MAX + 15} y2={TRACK_Y} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Track meter ticks */}
        {[0, 10, 20, 30, 40, 50].map((m) => {
          const x = X_MIN + (m / MAX_METRES) * (X_MAX - X_MIN)
          return (
            <g key={m}>
              <line x1={x} y1={TRACK_Y - 5} x2={x} y2={TRACK_Y + 7} stroke="var(--graphite)" strokeWidth="1.5" />
              <text x={x} y={TRACK_Y + 20} textAnchor="middle" fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)">
                {m}m
              </text>
            </g>
          )
        })}

        {/* Origin label */}
        <text x={X_MIN - 12} y={TRACK_Y + 4} textAnchor="end" fontSize="11" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          x = 0
        </text>

        {/* Displacement line from origin to cart */}
        <line x1={X_MIN} y1={TRACK_Y - 26} x2={cartPx} y2={TRACK_Y - 26} stroke="var(--pen-blue)" strokeWidth="1.8" strokeDasharray="3 4" />
        <text x={(X_MIN + cartPx) / 2} y={TRACK_Y - 30} textAnchor="middle" fontSize="10" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
          Δs = {s.toFixed(1)}m
        </text>

        {/* Moving Cart / Object */}
        <g transform={`translate(${cartPx}, ${TRACK_Y})`}>
          {/* Cart body */}
          <rect x="-18" y="-18" width="36" height="16" rx="2" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          {/* Wheels */}
          <circle cx="-10" cy="-2" r="4" fill="var(--ink)" />
          <circle cx="10" cy="-2" r="4" fill="var(--ink)" />
          <circle cx="-10" cy="-2" r="1.5" fill="var(--paper-light)" />
          <circle cx="10" cy="-2" r="1.5" fill="var(--paper-light)" />
          {/* Center marker */}
          <line x1="0" y1="-18" x2="0" y2="-2" stroke="var(--graphite)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Velocity Vector Arrow in pen-blue */}
          {v !== 0 && (
            <g stroke="var(--pen-blue)" strokeWidth="2" strokeLinecap="round">
              <line x1="0" y1="-10" x2={v * 3.5} y2="-10" />
              <polygon
                points={`${v * 3.5}, -10 ${v * 3.5 - (v > 0 ? 5 : -5)}, -13 ${v * 3.5 - (v > 0 ? 5 : -5)}, -7`}
                fill="var(--pen-blue)"
              />
              <text x={v * 3.5 + (v > 0 ? 6 : -14)} y="-8" fontSize="10" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
                v
              </text>
            </g>
          )}

          {/* Acceleration arrow in red if a != 0 */}
          {a !== 0 && (
            <g stroke="var(--pencil-red)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="0" y1="-24" x2={a * 6} y2="-24" />
              <polygon
                points={`${a * 6}, -24 ${a * 6 - (a > 0 ? 4 : -4)}, -26.5 ${a * 6 - (a > 0 ? 4 : -4)}, -21.5`}
                fill="var(--pencil-red)"
              />
              <text x={a * 6 + (a > 0 ? 5 : -12)} y="-22" fontSize="9" fill="var(--pencil-red)" fontFamily="var(--notes)">
                a
              </text>
            </g>
          )}
        </g>

        {/* Mini s-t graph in bottom right corner */}
        <g transform="translate(180, 115)">
          <rect x="-10" y="-8" width="180" height="95" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" opacity="0.6" />
          <text x="0" y="6" fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
            s-t Graph (Slope = Velocity)
          </text>
          {/* Graph axes */}
          <line x1="15" y1="78" x2="160" y2="78" stroke="var(--graphite)" strokeWidth="1.2" />
          <line x1="15" y1="78" x2="15" y2="16" stroke="var(--graphite)" strokeWidth="1.2" />
          <text x="162" y="82" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">t</text>
          <text x="8" y="18" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">s</text>
          {/* Parabolic s-t curve preview */}
          <path
            d="M 15 78 Q 75 60 150 25"
            fill="none"
            stroke="var(--pen-blue)"
            strokeWidth="1.8"
          />
          {/* Tangent slope line */}
          <line x1="60" y1="70" x2="130" y2="35" stroke="var(--pencil-red)" strokeWidth="1.2" strokeDasharray="3 3" />
        </g>
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Initial velocity (u)</span>
            <span>{u.toFixed(1)} m/s</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={u}
            onChange={(e) => setU(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Initial velocity in m/s"
          />
        </label>
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Acceleration (a)</span>
            <span>{a.toFixed(1)} m/s²</span>
          </div>
          <input
            type="range"
            min="-1.5"
            max="3"
            step="0.5"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Acceleration in m/s^2"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/15">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="rounded-sm border border-ink/60 bg-paper px-3 py-1 font-notes text-xs font-bold text-ink hover:border-pen-blue hover:text-pen-blue"
          >
            {running ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={() => setTime(0)}
            className="rounded-sm border border-ink/60 bg-paper px-3 py-1 font-notes text-xs font-bold text-ink hover:border-graphite"
          >
            ↺ Reset
          </button>
        </div>
        <p className="font-hand text-base text-pen-blue">
          s = ut + ½at² · The slope of the distance-time graph at any point equals instantaneous velocity v!
        </p>
      </div>
    </div>
  )
}
