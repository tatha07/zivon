// CircuitSim — interactive lesson block for Electric Circuits & Ohm's Law.
// Adjust voltage V and resistance R; flip the knife switch; watch the ammeter
// update via I = V / R with animated charge flow and filament glow.

import { useEffect, useRef, useState } from 'react'

const W = 360
const H = 230

export default function CircuitSim() {
  const [voltage, setVoltage] = useState(6) // Volts
  const [resistance, setResistance] = useState(4) // Ohms
  const [switchClosed, setSwitchClosed] = useState(true)
  const [, forceTick] = useState(0)

  const offsetRef = useRef(0)
  const lastRef = useRef(0)
  const rafRef = useRef(0)

  const current = switchClosed ? voltage / resistance : 0 // Amperes
  const power = switchClosed ? current * current * resistance : 0 // Watts

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) return
    let mounted = true
    const loop = (now: number) => {
      if (!mounted) return
      const dt = Math.min(0.05, (now - lastRef.current) / 1000 || 0.016)
      lastRef.current = now
      if (switchClosed && current > 0) {
        offsetRef.current = (offsetRef.current + current * 40 * dt) % 24
        forceTick((t) => (t + 1) % 1000)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [switchClosed, current, reduced])

  // Wire loop coordinates: rectangle
  const LEFT = 50
  const RIGHT = 310
  const TOP = 45
  const BOTTOM = 185

  // Glow radius based on power
  const glowOpacity = switchClosed ? Math.min(1, power / 18) : 0

  return (
    <div className="rounded-sm border border-ink/80 bg-paper-light p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/20 pb-2">
        <p className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">
          Interactive · Ohm&apos;s Law (V = IR)
        </p>
        <div className="flex items-center gap-3 font-notes text-sm text-ink" aria-live="polite">
          <span className="font-bold text-pen-blue">I = {current.toFixed(2)} A</span>
          <span>V = {voltage.toFixed(1)} V</span>
          <span>R = {resistance} Ω</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label={`Circuit simulation. Voltage ${voltage} volts, resistance ${resistance} ohms, current ${current.toFixed(2)} amperes. Switch is ${switchClosed ? 'closed' : 'open'}.`}
      >
        {/* Main rectangular wire path */}
        {/* Top wire with bulb gap (from LEFT to 155, then 205 to RIGHT) */}
        <line x1={LEFT} y1={TOP} x2="155" y2={TOP} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="205" y1={TOP} x2={RIGHT} y2={TOP} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Right wire with ammeter */}
        <line x1={RIGHT} y1={TOP} x2={RIGHT} y2="90" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={RIGHT} y1="140" x2={RIGHT} y2={BOTTOM} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Bottom wire with switch gap */}
        <line x1={RIGHT} y1={BOTTOM} x2="210" y2={BOTTOM} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="150" y1={BOTTOM} x2={LEFT} y2={BOTTOM} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Left wire with battery gap */}
        <line x1={LEFT} y1={BOTTOM} x2={LEFT} y2="135" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={LEFT} y1="95" x2={LEFT} y2={TOP} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Animated charge / current dashed overlay */}
        {switchClosed && current > 0 && (
          <g stroke="var(--pen-blue)" strokeWidth="2" strokeDasharray="6 18" strokeDashoffset={-offsetRef.current} fill="none" opacity="0.85">
            <polyline points={`${LEFT},95 ${LEFT},${TOP} 155,${TOP}`} />
            <polyline points={`205,${TOP} ${RIGHT},${TOP} ${RIGHT},90`} />
            <polyline points={`${RIGHT},140 ${RIGHT},${BOTTOM} 210,${BOTTOM}`} />
            <polyline points={`150,${BOTTOM} ${LEFT},${BOTTOM} ${LEFT},135`} />
          </g>
        )}

        {/* DC Battery Symbol on left wire */}
        {/* Long positive plate */}
        <line x1={LEFT - 14} y1="95" x2={LEFT + 14} y2="95" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        {/* Short negative plate */}
        <line x1={LEFT - 8} y1="107" x2={LEFT + 8} y2="107" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        {/* Second cell: long */}
        <line x1={LEFT - 14} y1="119" x2={LEFT + 14} y2="119" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        {/* Second cell: short */}
        <line x1={LEFT - 8} y1="131" x2={LEFT + 8} y2="131" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        {/* Polarity labels */}
        <text x={LEFT - 26} y="98" fontSize="13" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          +
        </text>
        <text x={LEFT - 24} y="136" fontSize="15" fill="var(--graphite)" fontFamily="var(--notes)" fontWeight="bold">
          −
        </text>
        <text x={LEFT - 40} y="118" fontSize="11" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
          {voltage}V
        </text>

        {/* Light Bulb (resistor) on top wire */}
        {/* Glow halo */}
        {glowOpacity > 0 && (
          <circle cx="180" cy={TOP} r={22 + glowOpacity * 10} fill="#fde047" opacity={0.35 * glowOpacity} />
        )}
        {/* Bulb glass */}
        <circle cx="180" cy={TOP} r="18" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="2" />
        {/* Filament cross inside */}
        <path d={`M 172 ${TOP + 6} L 180 ${TOP - 8} L 188 ${TOP + 6}`} fill="none" stroke={switchClosed ? "var(--pencil-red)" : "var(--graphite)"} strokeWidth="1.8" />
        {/* Glow ray ticks when shining */}
        {glowOpacity > 0.1 && (
          <g stroke="var(--pen-blue)" strokeWidth="1.5" strokeLinecap="round" opacity={glowOpacity}>
            <line x1="180" y1={TOP - 22} x2="180" y2={TOP - 28} />
            <line x1="162" y1={TOP - 14} x2="157" y2={TOP - 19} />
            <line x1="198" y1={TOP - 14} x2="203" y2={TOP - 19} />
          </g>
        )}
        <text x="180" y={TOP - 24} textAnchor="middle" fontSize="11" fill="var(--graphite)" fontFamily="var(--notes)">
          Bulb ({resistance} Ω)
        </text>

        {/* Ammeter on right wire */}
        <circle cx={RIGHT} cy="115" r="16" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="2" />
        <text x={RIGHT} y="120" textAnchor="middle" fontSize="13" fill="var(--ink)" fontFamily="var(--notes)" fontWeight="bold">
          A
        </text>
        <text x={RIGHT + 22} y="119" fontSize="11" fill="var(--pen-blue)" fontFamily="var(--notes)" fontWeight="bold">
          {current.toFixed(2)} A
        </text>

        {/* Knife Switch on bottom wire */}
        <circle cx="150" cy={BOTTOM} r="3.5" fill="var(--ink)" />
        <circle cx="210" cy={BOTTOM} r="3.5" fill="var(--ink)" />
        {/* Switch blade: horizontal if closed, raised at angle if open */}
        {switchClosed ? (
          <line x1="150" y1={BOTTOM} x2="210" y2={BOTTOM} stroke="var(--pen-blue)" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <line x1="150" y1={BOTTOM} x2="198" y2={BOTTOM - 24} stroke="var(--pencil-red)" strokeWidth="3" strokeLinecap="round" />
        )}
        <text x="180" y={BOTTOM + 18} textAnchor="middle" fontSize="11" fill="var(--graphite)" fontFamily="var(--notes)">
          Switch ({switchClosed ? 'CLOSED' : 'OPEN'})
        </text>

        {/* Conventional current direction arrow */}
        {switchClosed && (
          <g stroke="var(--pen-blue)" fill="var(--pen-blue)">
            <polygon points="105,41 113,45 105,49" />
            <text x="109" y="36" textAnchor="middle" fontSize="10" fontFamily="var(--notes)" fontWeight="bold">
              I →
            </text>
          </g>
        )}
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Voltage (V)</span>
            <span>{voltage.toFixed(1)} V</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="12"
            step="0.5"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Battery voltage in volts"
          />
        </label>
        <label className="block">
          <div className="flex justify-between font-notes text-xs font-bold uppercase tracking-wide text-graphite">
            <span>Resistance (R)</span>
            <span>{resistance} Ω</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pen-blue)]"
            aria-label="Bulb resistance in ohms"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/15">
        <button
          type="button"
          onClick={() => setSwitchClosed(!switchClosed)}
          className={`rounded-sm border px-3 py-1 font-notes text-xs font-bold transition-colors ${
            switchClosed
              ? 'border-pencil-red text-pencil-red hover:bg-pencil-red/10'
              : 'border-tick-green text-tick-green hover:bg-tick-green/10'
          }`}
        >
          {switchClosed ? 'Open Switch (Break Circuit)' : 'Close Switch (Connect Circuit)'}
        </button>
        <p className="font-hand text-base text-pen-blue">
          I = V / R · Doubling voltage doubles current; doubling resistance cuts it in half
        </p>
      </div>
    </div>
  )
}
