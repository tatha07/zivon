// MotionSim — interactive lesson block for Motion in a Straight Line.
// Controls for initial velocity u and acceleration a; animated cart moves
// along calibrated 1D track; real-time dynamic s-t (or v-t) graph plotting
// point-by-point as the cart moves with dynamic slope/tangent line.

import { useEffect, useRef, useState, useCallback } from 'react'

const W = 360
const H = 285
const TRACK_Y = 52
const X_MIN = 35
const X_MAX = 325
const MAX_METRES = 50 // track length in metres
const MAX_TIME = 8 // graph x-axis duration in seconds

interface DataPoint {
  t: number
  s: number
  v: number
}

export default function MotionSim() {
  const [u, setU] = useState(2) // initial velocity in m/s
  const [a, setA] = useState(1.5) // acceleration in m/s^2
  const [time, setTime] = useState(0) // seconds elapsed
  const [running, setRunning] = useState(true)
  const [graphMode, setGraphMode] = useState<'st' | 'vt'>('st') // s-t or v-t graph
  const [history, setHistory] = useState<DataPoint[]>([])

  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const historyRef = useRef<DataPoint[]>([])

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Reset simulation and history
  const resetSim = useCallback(() => {
    setTime(0)
    historyRef.current = [{ t: 0, s: 0, v: u }]
    setHistory([{ t: 0, s: 0, v: u }])
  }, [u])

  useEffect(() => {
    resetSim()
  }, [resetSim, a])

  useEffect(() => {
    if (reduced) return
    let mounted = true
    const loop = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.04, (now - lastRef.current) / 1000 || 0.016)
      lastRef.current = now

      if (running) {
        setTime((prevT) => {
          const nextT = prevT + dt
          const currentS = u * nextT + 0.5 * a * nextT * nextT
          const currentV = u + a * nextT

          // Loop reset if reaching end of track or max time
          if (currentS >= MAX_METRES || nextT >= MAX_TIME || (nextT > 1 && currentS <= 0)) {
            historyRef.current = [{ t: 0, s: 0, v: u }]
            setHistory([{ t: 0, s: 0, v: u }])
            return 0
          }

          // Sample data point every ~0.04s
          if (historyRef.current.length === 0 || nextT - historyRef.current[historyRef.current.length - 1].t >= 0.04) {
            const pt = { t: nextT, s: currentS, v: currentV }
            historyRef.current.push(pt)
            setHistory([...historyRef.current])
          }

          return nextT
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

  // Graph plotting layout — spacious coordinates without overlap
  const GX0 = 48
  const GY0 = 248
  const GW = 270
  const GH = 92

  // Coordinates mapping functions
  const mapT = (tVal: number) => GX0 + (Math.min(MAX_TIME, tVal) / MAX_TIME) * GW
  const mapS = (sVal: number) => GY0 - (Math.min(MAX_METRES, Math.max(0, sVal)) / MAX_METRES) * GH
  const MAX_V_SCALE = 20
  const mapV = (vVal: number) => GY0 - (Math.min(MAX_V_SCALE, Math.max(0, vVal)) / MAX_V_SCALE) * GH

  // Build dynamic SVG path from history
  let dynamicPathD = ''
  if (history.length > 0) {
    if (graphMode === 'st') {
      dynamicPathD = `M ${mapT(history[0].t)} ${mapS(history[0].s)}`
      for (let i = 1; i < history.length; i++) {
        dynamicPathD += ` L ${mapT(history[i].t).toFixed(1)} ${mapS(history[i].s).toFixed(1)}`
      }
    } else {
      dynamicPathD = `M ${mapT(history[0].t)} ${mapV(history[0].v)}`
      for (let i = 1; i < history.length; i++) {
        dynamicPathD += ` L ${mapT(history[i].t).toFixed(1)} ${mapV(history[i].v).toFixed(1)}`
      }
    }
  }

  // Current head point coordinates on the graph
  const headX = mapT(time)
  const headY = graphMode === 'st' ? mapS(s) : mapV(v)

  // Tangent slope line for s-t graph (slope = v)
  const tanDx = 24
  const scaleRatio = (GH / MAX_METRES) / (GW / MAX_TIME)
  const tanDy = -v * scaleRatio * tanDx

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · 1D Kinematics & Dynamic Plot
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
              <line x1={x} y1={TRACK_Y - 4} x2={x} y2={TRACK_Y + 5} stroke="var(--graphite)" strokeWidth="1.5" />
              <text x={x} y={TRACK_Y + 16} textAnchor="middle" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">
                {m}m
              </text>
            </g>
          )
        })}

        {/* Origin label */}
        <text x={X_MIN - 12} y={TRACK_Y + 3} textAnchor="end" fontSize="10" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          x = 0
        </text>

        {/* Displacement line from origin to cart */}
        <line x1={X_MIN} y1={TRACK_Y - 24} x2={cartPx} y2={TRACK_Y - 24} stroke="var(--pen-blue)" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={(X_MIN + cartPx) / 2} y={TRACK_Y - 28} textAnchor="middle" fontSize="10" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
          Δs = {s.toFixed(1)}m
        </text>

        {/* Moving Cart / Object */}
        <g transform={`translate(${cartPx}, ${TRACK_Y})`}>
          <rect x="-16" y="-16" width="32" height="14" rx="2" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="-9" cy="-2" r="3.5" fill="var(--ink)" />
          <circle cx="9" cy="-2" r="3.5" fill="var(--ink)" />
          <circle cx="-9" cy="-2" r="1.5" fill="var(--paper-light)" />
          <circle cx="9" cy="-2" r="1.5" fill="var(--paper-light)" />

          {/* Velocity Vector Arrow in pen-blue */}
          {v !== 0 && (
            <g stroke="var(--pen-blue)" strokeWidth="2" strokeLinecap="round">
              <line x1="0" y1="-9" x2={v * 3.5} y2="-9" />
              <polygon
                points={`${v * 3.5}, -9 ${v * 3.5 - (v > 0 ? 5 : -5)}, -12 ${v * 3.5 - (v > 0 ? 5 : -5)}, -6`}
                fill="var(--pen-blue)"
              />
              <text x={v * 3.5 + (v > 0 ? 5 : -12)} y="-8" fontSize="9" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
                v
              </text>
            </g>
          )}

          {/* Acceleration arrow in red */}
          {a !== 0 && (
            <g stroke="var(--pencil-red)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="0" y1="-22" x2={a * 5.5} y2="-22" />
              <polygon
                points={`${a * 5.5}, -22 ${a * 5.5 - (a > 0 ? 4 : -4)}, -24.5 ${a * 5.5 - (a > 0 ? 4 : -4)}, -19.5`}
                fill="var(--pencil-red)"
              />
              <text x={a * 5.5 + (a > 0 ? 5 : -10)} y="-20" fontSize="8" fill="var(--pencil-red)" fontFamily="var(--notes)">
                a
              </text>
            </g>
          )}
        </g>

        {/* DYNAMIC GRAPH CONTAINER */}
        <g>
          {/* Graph background panel */}
          <rect x="12" y="108" width="336" height="166" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.2" rx="2" />

          {/* Dedicated Header Row: Title on Left, Real-time Slope on Right */}
          <text x="24" y="126" fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
            GRAPH: {graphMode === 'st' ? 'Position–Time (s-t)' : 'Velocity–Time (v-t)'}
          </text>
          <text x="336" y="126" textAnchor="end" fontSize="11" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
            {graphMode === 'st' ? `ds/dt = v = ${v.toFixed(1)} m/s` : `dv/dt = a = ${a.toFixed(1)} m/s²`}
          </text>

          {/* Y-axis Title clearly placed above Y axis */}
          <text x={GX0} y="144" fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold" textAnchor="middle">
            {graphMode === 'st' ? 's (m)' : 'v (m/s)'}
          </text>

          {/* Grid lines */}
          {[0, 2, 4, 6, 8].map((tVal) => (
            <line
              key={tVal}
              x1={mapT(tVal)}
              y1={GY0}
              x2={mapT(tVal)}
              y2={GY0 - GH}
              stroke="var(--graphite)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              opacity="0.3"
            />
          ))}
          {[0, 10, 20, 30, 40, 50].map((sVal) => (
            <line
              key={sVal}
              x1={GX0}
              y1={mapS(sVal)}
              x2={GX0 + GW}
              y2={mapS(sVal)}
              stroke="var(--graphite)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              opacity="0.3"
            />
          ))}

          {/* X and Y Axes */}
          <line x1={GX0} y1={GY0} x2={GX0 + GW + 6} y2={GY0} stroke="var(--graphite)" strokeWidth="1.5" />
          <line x1={GX0} y1={GY0} x2={GX0} y2={GY0 - GH} stroke="var(--graphite)" strokeWidth="1.5" />

          {/* Time axis label */}
          <text x={GX0 + GW + 10} y={GY0 + 3} fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
            t (s)
          </text>

          {/* Time axis ticks */}
          {[0, 2, 4, 6, 8].map((tVal) => (
            <g key={tVal}>
              <line x1={mapT(tVal)} y1={GY0} x2={mapT(tVal)} y2={GY0 + 4} stroke="var(--graphite)" strokeWidth="1.2" />
              <text x={mapT(tVal)} y={GY0 + 13} textAnchor="middle" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">
                {tVal}s
              </text>
            </g>
          ))}

          {/* Y-axis ticks */}
          {graphMode === 'st'
            ? [0, 25, 50].map((sVal) => (
                <g key={sVal}>
                  <line x1={GX0 - 4} y1={mapS(sVal)} x2={GX0} y2={mapS(sVal)} stroke="var(--graphite)" strokeWidth="1.2" />
                  <text x={GX0 - 6} y={mapS(sVal) + 3} textAnchor="end" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">
                    {sVal}
                  </text>
                </g>
              ))
            : [0, 10, 20].map((vVal) => (
                <g key={vVal}>
                  <line x1={GX0 - 4} y1={mapV(vVal)} x2={GX0} y2={mapV(vVal)} stroke="var(--graphite)" strokeWidth="1.2" />
                  <text x={GX0 - 6} y={mapV(vVal) + 3} textAnchor="end" fontSize="9" fill="var(--graphite)" fontFamily="var(--notes)">
                    {vVal}
                  </text>
                </g>
              ))}

          {/* Area under v-t graph if in vt mode */}
          {graphMode === 'vt' && history.length > 1 && (
            <path
              d={`${dynamicPathD} L ${headX} ${GY0} L ${GX0} ${GY0} Z`}
              fill="var(--pen-blue)"
              opacity="0.15"
            />
          )}

          {/* DYNAMIC PLOTTED TRAJECTORY CURVE */}
          {dynamicPathD && (
            <path
              d={dynamicPathD}
              fill="none"
              stroke="var(--pen-blue)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dynamic Tangent / Slope line at current position */}
          {graphMode === 'st' && time > 0.05 && (
            <line
              x1={headX - tanDx}
              y1={headY - tanDy}
              x2={headX + tanDx}
              y2={headY + tanDy}
              stroke="var(--pencil-red)"
              strokeWidth="1.8"
              strokeDasharray="3 3"
            />
          )}

          {/* Current Live Head Marker Dot */}
          <circle cx={headX} cy={headY} r="4.5" fill="var(--pen-blue)" stroke="var(--paper-light)" strokeWidth="1.5" />
          <circle cx={headX} cy={headY} r="8" fill="none" stroke="var(--pen-blue)" strokeWidth="1" opacity="0.4" />
        </g>
      </svg>

      {/* Controls & Mode toggles */}
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="rounded-sm border border-ink/60 bg-paper px-3 py-1 font-notes text-xs font-bold text-ink hover:border-pen-blue hover:text-pen-blue"
          >
            {running ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={resetSim}
            className="rounded-sm border border-ink/60 bg-paper px-3 py-1 font-notes text-xs font-bold text-ink hover:border-graphite"
          >
            Reset Graph
          </button>
          <button
            type="button"
            onClick={() => setGraphMode(graphMode === 'st' ? 'vt' : 'st')}
            className="rounded-sm border border-pen-blue bg-paper px-2.5 py-1 font-notes text-xs font-bold text-pen-blue hover:bg-pen-blue hover:text-paper"
          >
            Switch to {graphMode === 'st' ? 'v-t Graph' : 's-t Graph'}
          </button>
        </div>
        <p className="font-hand text-base text-pen-blue">
          {graphMode === 'st'
            ? 'The red dashed tangent shows instantaneous slope ds/dt = v!'
            : 'For v-t graph: slope = acceleration a; area under the curve = displacement s!'}
        </p>
      </div>
    </div>
  )
}
