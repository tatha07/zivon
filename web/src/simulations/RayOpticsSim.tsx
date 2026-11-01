// RayOpticsSim — interactive lesson block for Light and Reflection.
// Drag the incident ray or use the angle slider; watch the reflected ray dynamically
// mirror at θi = θr. Shows mirror hatching, dashed normal, equal angle arcs, and
// optional virtual ray extensions behind the mirror.

import { useRef, useState } from 'react'

const W = 360
const H = 240
const O = { x: W / 2, y: 170 } // Point of incidence on mirror
const RAY_LEN = 140

export default function RayOpticsSim() {
  const [angleDeg, setAngleDeg] = useState(40) // angle with normal
  const [showVirtual, setShowVirtual] = useState(true)
  const draggingRef = useRef(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Incident ray angle: theta measured from normal (upwards, -y)
  const rad = (angleDeg * Math.PI) / 180
  const incidentX = O.x - RAY_LEN * Math.sin(rad)
  const incidentY = O.y - RAY_LEN * Math.cos(rad)

  const reflectedX = O.x + RAY_LEN * Math.sin(rad)
  const reflectedY = O.y - RAY_LEN * Math.cos(rad)

  // Virtual ray behind the mirror
  const virtualX = O.x - RAY_LEN * Math.sin(rad) * 0.75
  const virtualY = O.y + RAY_LEN * Math.cos(rad) * 0.75

  const setFromPointer = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((clientX - rect.left) / rect.width) * W - O.x
    const y = O.y - ((clientY - rect.top) / rect.height) * H // height above mirror
    if (y <= 5) return // don't drag below mirror
    let deg = (Math.atan2(-x, y) * 180) / Math.PI
    deg = Math.max(5, Math.min(80, deg))
    setAngleDeg(Math.round(deg))
  }

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · Drag ray or adjust angle
        </p>
        <div className="flex items-center gap-3 font-notes text-sm text-ink" aria-live="polite">
          <span className="font-bold text-pen-blue">∠i = {angleDeg}°</span>
          <span className="font-bold text-pen-blue">∠r = {angleDeg}°</span>
          <span className="text-graphite">∠i = ∠r</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="application"
        aria-label={`Reflection simulation. Angle of incidence ${angleDeg} degrees equals angle of reflection ${angleDeg} degrees.`}
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
        {/* Plane mirror surface */}
        <line x1="20" y1={O.y} x2={W - 20} y2={O.y} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        {/* Silvered backing hatching lines */}
        <g stroke="var(--graphite)" strokeWidth="1.5">
          {[30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330].map((x) => (
            <line key={x} x1={x} y1={O.y} x2={x - 10} y2={O.y + 12} />
          ))}
        </g>
        <text x={W - 25} y={O.y + 18} fontSize="10" fill="var(--graphite)" fontFamily="var(--notes)" textAnchor="end">
          Plane Mirror
        </text>

        {/* Normal line perpendicular to mirror at O */}
        <line x1={O.x} y1={O.y} x2={O.x} y2={20} stroke="var(--graphite)" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x={O.x + 6} y="28" fontSize="12" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
          Normal (N)
        </text>

        {/* Right-angle symbol at normal */}
        <path d={`M ${O.x - 12} ${O.y} v -12 h 12`} fill="none" stroke="var(--graphite)" strokeWidth="1.2" />

        {/* Virtual ray behind mirror (if enabled) */}
        {showVirtual && (
          <g opacity="0.6">
            <line x1={O.x} y1={O.y} x2={virtualX} y2={virtualY} stroke="var(--pencil-red)" strokeWidth="1.8" strokeDasharray="3 4" />
            <circle cx={virtualX} cy={virtualY} r="4" fill="var(--pencil-red)" />
            <text x={virtualX - 8} y={virtualY + 14} fontSize="10" fill="var(--pencil-red)" fontFamily="var(--notes)">
              Virtual path
            </text>
          </g>
        )}

        {/* Angle of incidence arc (between normal and incident ray) */}
        <path
          d={`M ${O.x - 45 * Math.sin(rad)} ${O.y - 45 * Math.cos(rad)} A 45 45 0 0 1 ${O.x} ${O.y - 45}`}
          stroke="var(--ink)"
          strokeWidth="1.5"
          fill="none"
        />
        <text
          x={O.x - 55 * Math.sin(rad / 2)}
          y={O.y - 55 * Math.cos(rad / 2)}
          fontSize="12"
          fill="var(--ink)"
          fontFamily="var(--hand)"
          fontWeight="bold"
          textAnchor="middle"
        >
          θi
        </text>

        {/* Angle of reflection arc (between normal and reflected ray) */}
        <path
          d={`M ${O.x} ${O.y - 45} A 45 45 0 0 1 ${O.x + 45 * Math.sin(rad)} ${O.y - 45 * Math.cos(rad)}`}
          stroke="var(--pen-blue)"
          strokeWidth="1.5"
          fill="none"
        />
        <text
          x={O.x + 55 * Math.sin(rad / 2)}
          y={O.y - 55 * Math.cos(rad / 2)}
          fontSize="12"
          fill="var(--pen-blue)"
          fontFamily="var(--hand)"
          fontWeight="bold"
          textAnchor="middle"
        >
          θr
        </text>

        {/* Incident Ray in ink with arrowhead pointing towards O */}
        <line x1={incidentX} y1={incidentY} x2={O.x} y2={O.y} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Incident arrow midway */}
        {(() => {
          const midX = (incidentX + O.x) / 2
          const midY = (incidentY + O.y) / 2
          const dx = Math.sin(rad)
          const dy = Math.cos(rad)
          return (
            <polygon
              points={`${midX + dx * 6},${midY + dy * 6} ${midX - dx * 6 - dy * 5},${midY - dy * 6 + dx * 5} ${midX - dx * 6 + dy * 5},${midY - dy * 6 - dx * 5}`}
              fill="var(--ink)"
            />
          )
        })()}
        <circle cx={incidentX} cy={incidentY} r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" cursor="grab" />
        <text x={incidentX - 10} y={incidentY - 8} fontSize="11" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          Light Source
        </text>

        {/* Point of incidence O */}
        <circle cx={O.x} cy={O.y} r="3" fill="var(--ink)" />
        <text x={O.x - 4} y={O.y + 16} fontSize="11" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          O
        </text>

        {/* Reflected Ray in pen-blue with arrowhead pointing away from O */}
        <line x1={O.x} y1={O.y} x2={reflectedX} y2={reflectedY} stroke="var(--pen-blue)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Reflected arrow midway */}
        {(() => {
          const midX = (O.x + reflectedX) / 2
          const midY = (O.y + reflectedY) / 2
          const dx = Math.sin(rad)
          const dy = -Math.cos(rad)
          return (
            <polygon
              points={`${midX + dx * 6},${midY + dy * 6} ${midX - dx * 6 - dy * 5},${midY - dy * 6 + dx * 5} ${midX - dx * 6 + dy * 5},${midY - dy * 6 - dx * 5}`}
              fill="var(--pen-blue)"
            />
          )
        })()}
        <text x={reflectedX + 8} y={reflectedY} fontSize="11" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
          Reflected ray
        </text>
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Angle of Incidence (θi)</span>
            <span>{angleDeg}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="75"
            step="1"
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Angle of incidence in degrees"
          />
        </label>
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
          <label className="flex items-center gap-2 cursor-pointer font-notes text-xs font-bold text-graphite">
            <input
              type="checkbox"
              checked={showVirtual}
              onChange={(e) => setShowVirtual(e.target.checked)}
              className="accent-[var(--pencil-red)]"
            />
            Show virtual image extension
          </label>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-ink/15">
        <p className="font-hand text-base text-pen-blue">
          1st Law: incident ray, reflected ray, and the normal all lie in the same plane · 2nd Law: ∠i = ∠r
        </p>
      </div>
    </div>
  )
}
