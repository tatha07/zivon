// Pen underline generator — the canonical algorithm from
// docs/frontend/design-doctrine.md §4.1 (ported to TypeScript from the reference
// implementation in design-doctrine-example.html). Every pen underline in the
// product comes from this file. Never use CSS text-underline or border-bottom.
//
// All parameters are in em of the underlined text's font size, so the look is
// identical at any scale. The jitter is seeded from the underlined string:
// the same string always redraws the same underline.

/** Stroke centerline below the inline box bottom, in em (Bricolage Grotesque descent ≈ 0.22em). */
const CENTER_BELOW_BOX = 0.28

/** FNV-1a string hash → uint32 seed. */
function seedFrom(s: string): number {
  let h = 2166136261 >>> 0
  for (const c of s) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Tiny deterministic PRNG (mulberry32). */
function rng(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function textNodes(el: HTMLElement): Text[] {
  return Array.from(el.childNodes).filter(
    (n): n is Text => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim(),
  )
}

function textWidth(el: HTMLElement): number {
  let w = 0
  for (const n of textNodes(el)) {
    const r = document.createRange()
    r.selectNodeContents(n)
    w += r.getBoundingClientRect().width
  }
  return w
}

export interface PenUnderlineOptions {
  /** Strikethrough variant: through the x-height middle instead of below the baseline. */
  strike?: boolean
}

/**
 * Draws a generated pen-blue underline (or strikethrough) inside `el`.
 * `el` must have `position: relative` and no other absolutely-positioned children;
 * the component <PenUnderline> guarantees this. Idempotent per element+variant.
 */
export function drawPenUnderline(el: HTMLElement, options: PenUnderlineOptions = {}): void {
  const markerClass = options.strike ? 'pen-strike' : 'pen-uline'
  if (el.querySelector(`svg.${markerClass}`)) return // already drawn
  const fs = parseFloat(getComputedStyle(el).fontSize)
  const text = textNodes(el).map((n) => n.textContent).join(' ').trim()
  const w = textWidth(el)
  if (!w || !fs) return

  const strike = !!options.strike
  // span: ink width + 0.09em left overshoot; right tail 0.18em (strike: 0.09em each side)
  const L = w + 0.09 * fs + (strike ? 0.09 : 0.18) * fs
  const x0 = -0.09 * fs
  const n = Math.max(4, Math.round(L / (0.45 * fs))) // control spacing 0.45em
  const amp = 0.02 * fs // wave amplitude
  const period = 4 * fs // wave period
  const phase = 0.7 // wave phase (rad)
  const rnd = rng(seedFrom(text))
  // position: underline sits CENTER_BELOW_BOX*fs below the inline box bottom (top:100%);
  // strikethrough rides through the x-height middle, i.e. above the box bottom by
  // (ascent − 0.26em). For Bricolage, box bottom ≈ baseline + 0.22em, so
  // x-height middle ≈ box bottom − 0.48em. We place the svg at top:100% and shift up.
  const baseY = strike ? -0.48 * fs : CENTER_BELOW_BOX * fs
  // taper: 0.067em → 0.033em (strike: 0.056em → 0.033em)
  const wStart = strike ? 0.056 : 0.067
  const wEnd = 0.033

  const top: Array<[number, number]> = []
  const bot: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = x0 + L * t
    const y = baseY + amp * Math.sin((2 * Math.PI * (L * t)) / period + phase) + (rnd() * 2 - 1) * 0.007 * fs
    const hw = ((wStart + (wEnd - wStart) * t) * fs) / 2
    top.push([x, y - hw])
    bot.push([x, y + hw])
  }
  const d =
    top
      .concat(bot.reverse())
      .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
      .join(' ') + ' Z'

  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', markerClass)
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', String(Math.ceil(w)))
  svg.setAttribute('height', String(Math.ceil(fs)))
  svg.setAttribute('overflow', 'visible')
  svg.style.position = 'absolute'
  svg.style.left = '0'
  svg.style.top = '100%'
  svg.style.height = '0'
  svg.style.pointerEvents = 'none'
  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', d)
  path.setAttribute('fill', 'var(--pen-blue)')
  svg.appendChild(path)
  el.appendChild(svg)
}

/** Redraw on resize (widths change); fonts settle after one frame. Returns a cleanup fn. */
export function schedulePenUnderline(el: HTMLElement, options?: PenUnderlineOptions): () => void {
  const run = () => drawPenUnderline(el, options)
  const raf = requestAnimationFrame(run)
  if (document.fonts?.ready) document.fonts.ready.then(run).catch(() => {})
  window.addEventListener('resize', run)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', run)
  }
}
