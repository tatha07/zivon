// Course content schema — the contract between the UI and whatever supplies courses.
// The UI imports these types only; DATA must come through src/content/courseSource.ts.
// When the agentic content pipeline is ready, its output is mapped into this shape
// (or its fields are renamed to match it) — see MODIFY.md, "Plugging in the pipeline".

/**
 * Key of a hand-drawn SVG sketch rendered beside a course card / page header.
 * Implementations live in src/components/HandDrawnSketches.tsx.
 * Pipeline note: emit one of these keys when the generated page has a matching
 * sketch; omit the field otherwise. Never point at an image URL — sketches are code.
 */
export type SketchKey = 'pendulum' | 'ray' | 'wave' | 'circuit'

/**
 * Key of an interactive simulation rig mounted inside the course page.
 * Implementations live in src/simulations/. This is how existing rigs stay wired:
 * a course carries a simulation key instead of the page importing rig code directly.
 * Pipeline note: optional. Omit until a real interactive block exists for the topic.
 */
export type SimulationKey = 'pendulum' | 'wave'

/** One lesson / section inside a course. Maps to one Synthesizer JSON block group. */
export interface Lesson {
  /**
   * Unique within its course, stable across regenerations, lowercase-kebab.
   * Used as a React key and in anchors. Pipeline: derive from the lesson slug.
   */
  id: string
  /** Short title shown in the lesson list, e.g. "Distance and displacement". Required. */
  title: string
  /** One or two plain sentences under the title. Optional — UI hides it when missing. */
  summary?: string
  /**
   * Honest status shown next to the lesson. 'done' renders a tick-green check,
   * anything else renders nothing. Pipeline: mark lessons students have actually
   * been validated on as 'done'; leave the rest undefined. No fake progress.
   */
  status?: 'done'
}

/** A course — what one topic card links to. The unit of the content factory's output. */
export interface Course {
  /**
   * Globally unique, URL-safe, lowercase-kebab (e.g. "motion"). Drives routing:
   * #/course/<id>. Filler ids always start with "filler-" so they are greppable.
   * Pipeline: assign once, never reuse, never rename after pages go live.
   */
  id: string
  /** Topic name shown on the card and page headline, e.g. "Motion in a Straight Line". Required. */
  title: string
  /**
   * Class level as students say it, e.g. "Class 9". Rendered as a small mono tag.
   * Optional — hidden when missing. Pipeline: from the NCERT source pack metadata.
   */
  classLevel?: string
  /**
   * Chapter reference, e.g. "Ch 8 · NCERT Motion". Next to classLevel. Optional.
   */
  chapterTag?: string
  /** One honest sentence about what the student learns. Card body + page subhead. Optional. */
  summary?: string
  /**
   * Plain-text formula, e.g. "v = u + at". Rendered in Courier Prime. Optional.
   * Pipeline: keep it ASCII/Unicode text, not LaTeX or images.
   */
  equation?: string
  /** Hand-drawn sketch key (see SketchKey). Optional. */
  sketch?: SketchKey
  /** Interactive rig key (see SimulationKey). Optional. */
  simulation?: SimulationKey
  /** Lessons in teaching order. Empty array is allowed — the page shows a friendly placeholder. */
  lessons: Lesson[]
}
