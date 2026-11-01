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
    sketch: 'wave',
    simulation: 'wave',
    lessons: [
      { id: 'filler-motion-1', title: 'Filler lesson: rest, motion, and reference points', summary: 'Placeholder text. The real lesson will explain why "still" depends on where you are standing.' },
      { id: 'filler-motion-2', title: 'Filler lesson: speed vs. velocity', summary: 'Placeholder text. Distance, displacement, and the one word that separates the two.' },
      { id: 'filler-motion-3', title: 'Filler lesson: equations of motion', summary: 'Placeholder text. Three formulas, when each one applies, and a worked example.', status: 'done' },
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
    lessons: [
      { id: 'filler-light-1', title: 'Filler lesson: laws of reflection', summary: 'Placeholder text. Two laws, one normal line, and angles measured from it.' },
      { id: 'filler-light-2', title: 'Filler lesson: plane and spherical mirrors', summary: 'Placeholder text. Concave, convex, and what each does to your image.' },
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
      { id: 'filler-osc-1', title: 'Filler lesson: periodic motion around us', summary: 'Placeholder text. Swings, heartbeats, quartz — spotting repeats everywhere.' },
      { id: 'filler-osc-2', title: 'Filler lesson: the simple pendulum', summary: 'Placeholder text. Length, gravity, and why mass does not matter.' },
      { id: 'filler-osc-3', title: 'Filler lesson: measuring g with a pendulum', summary: 'Placeholder text. One stopwatch, one string, one school lab.' },
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
    lessons: [
      { id: 'filler-circ-1', title: 'Filler lesson: current, voltage, resistance', summary: 'Placeholder text. The water-pipe analogy, and where it breaks.' },
      { id: 'filler-circ-2', title: 'Filler lesson: series and parallel', summary: 'Placeholder text. Two ways to wire, two very different outcomes.' },
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
    lessons: [
      { id: 'filler-waves-1', title: 'Filler lesson: what a wave carries', summary: 'Placeholder text. Energy moves, the medium mostly stays put.' },
      { id: 'filler-waves-2', title: 'Filler lesson: frequency, amplitude, and hearing', summary: 'Placeholder text. Pitch comes from one, loudness from the other.' },
    ],
  },
]
