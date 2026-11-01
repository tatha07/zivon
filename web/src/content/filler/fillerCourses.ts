// FILLER DATA: DELETE OR REPLACE. See README.md section "Replacing the filler content".
//
// Five placeholder physics topics so the landing page and course pages can be built
// and reviewed before the content pipeline ships real courses. Every id starts with
// "filler-". Nothing outside src/content/ may import this file.

import type { Course } from '../types'

export const FILLER_COURSES: Course[] = [
  {
    id: 'filler-motion',
    title: 'Filler: Motion in a Straight Line',
    classLevel: 'Class 9',
    chapterTag: 'Ch 8 · placeholder',
    summary: 'Speed, velocity, and reading a distance-time graph — sample topic, not real course content yet.',
    equation: 'v = u + at',
    sketch: 'motion',
    simulation: 'motion',
    lessons: [
      { id: 'filler-motion-1', title: 'Rest, motion, and reference frames', summary: 'Why "still" depends on where you stand — relative motion and reference points.' },
      { id: 'filler-motion-2', title: 'Speed vs. velocity', summary: 'Distance vs displacement, scalars vs vectors, and the direction that separates them.' },
      { id: 'filler-motion-3', title: 'Equations of uniformly accelerated motion', summary: 'Three kinematic equations: v = u + at, s = ut + ½at², and v² = u² + 2as.', status: 'done' },
    ],
  },
  {
    id: 'filler-light',
    title: 'Filler: Light and Reflection',
    classLevel: 'Class 10',
    chapterTag: 'Ch 10 · placeholder',
    summary: 'How light bounces, and why mirrors flip left-to-right — sample topic, not real course content yet.',
    equation: 'θᵢ = θᵣ',
    sketch: 'ray',
    simulation: 'ray',
    lessons: [
      { id: 'filler-light-1', title: 'Laws of reflection', summary: 'Two laws, the perpendicular normal line, and why angles are measured from the normal.' },
      { id: 'filler-light-2', title: 'Plane mirrors and virtual images', summary: 'Virtual, erect, laterally inverted, and same distance behind the mirror.' },
    ],
  },
  {
    id: 'filler-oscillations',
    title: 'Filler: Simple Pendulum and Oscillations',
    classLevel: 'Class 11',
    chapterTag: 'Ch 14 · placeholder',
    summary: 'Why a swing keeps time, and what actually changes its period — sample topic, not real course content yet.',
    equation: 'T = 2π√(L/g)',
    sketch: 'pendulum',
    simulation: 'pendulum',
    lessons: [
      { id: 'filler-osc-1', title: 'Periodic motion and time period', summary: 'Swings, heartbeats, clocks — spotting repeats and restoring forces.' },
      { id: 'filler-osc-2', title: 'The simple pendulum equation', summary: 'Length, gravity, and proving why bob mass does not affect time period.' },
      { id: 'filler-osc-3', title: 'Measuring local g with a pendulum', summary: 'Using length and oscillation stopwatch timings in the physics lab.' },
    ],
  },
  {
    id: 'filler-circuits',
    title: 'Filler: Electric Circuits',
    classLevel: 'Class 10',
    chapterTag: 'Ch 12 · placeholder',
    summary: 'Current, voltage, and what happens when you add another bulb — sample topic, not real course content yet.',
    equation: 'V = IR',
    sketch: 'circuit',
    simulation: 'circuit',
    lessons: [
      { id: 'filler-circ-1', title: 'Current, voltage, and resistance', summary: 'Electric potential difference driving charge flow through a resistor.' },
      { id: 'filler-circ-2', title: 'Ohm’s law and circuit loops', summary: 'Direct proportionality of current to potential difference at constant temperature.' },
    ],
  },
  {
    id: 'filler-waves',
    title: 'Filler: Waves and Sound',
    classLevel: 'Class 9',
    chapterTag: 'Ch 12 · placeholder',
    summary: 'How sound travels, and why pitch and loudness are not the same thing — sample topic, not real course content yet.',
    equation: 'v = fλ',
    sketch: 'wave',
    simulation: 'wave',
    lessons: [
      { id: 'filler-waves-1', title: 'Filler lesson: what a wave carries', summary: 'Placeholder text. Energy moves, the medium mostly stays put.' },
      { id: 'filler-waves-2', title: 'Filler lesson: frequency, amplitude, and hearing', summary: 'Placeholder text. Pitch comes from one, loudness from the other.' },
    ],
  },
]
