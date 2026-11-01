// courseSource.ts — THE ONLY MODULE THE UI IMPORTS COURSE DATA FROM.
//
// Today it serves filler from ./filler/fillerCourses.ts. Later it will be pointed
// at the content pipeline's output (JSON files, an API, or a generated folder).
// The swap touches only this file: implement the same three functions against the
// real source, set IS_FILLER_CONTENT to false, delete ./filler/. No UI change.
// See README.md → "Replacing the filler content", and MODIFY.md.

import type { Course } from './types'
// FILLER DATA: DELETE OR REPLACE. Remove this import when the pipeline goes live.
import { FILLER_COURSES } from './filler/fillerCourses'

/**
 * True while every course below is placeholder material. The topics section shows
 * one small Caveat note ("sample topics for now…") when true. Set to false the
 * moment real courses are plugged in — the note disappears on its own.
 */
export const IS_FILLER_CONTENT = true

/** All courses, in display order. The landing page renders exactly this list. */
export function getCourses(): Course[] {
  return FILLER_COURSES
}

/** One course by its URL id (#/course/<id>). Undefined when the id is unknown. */
export function getCourseById(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id)
}

/** A course's lessons in teaching order. Empty array when the course or its lessons are missing. */
export function getLessonsForCourse(id: string): Course['lessons'] {
  return getCourseById(id)?.lessons ?? []
}
