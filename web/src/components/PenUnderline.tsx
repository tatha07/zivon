// One pen underline, drawn by the canonical algorithm (docs/frontend/design-doctrine.md §4.1).
// Usage: <PenUnderline>one phrase worth noticing</PenUnderline>
// Rule: at most ONE pen annotation per section/screen — don't wrap whole paragraphs.

import { useEffect, useRef } from 'react'
import { schedulePenUnderline } from '../lib/penUnderline'

export default function PenUnderline({
  children,
  as: Tag = 'span',
  strike = false,
}: {
  children: string
  as?: 'span' | 'h1' | 'strong'
  strike?: boolean
}) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    return schedulePenUnderline(ref.current, { strike })
  }, [children, strike])
  return (
    <Tag ref={ref as never} className="relative inline-block">
      {children}
    </Tag>
  )
}
