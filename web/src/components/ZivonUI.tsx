// Shared UI atoms for the Field Notes system. Keep these tiny; tokens live in index.css.

// ZivonUI — landing page + course page. Contains ZERO hardcoded course names, ids,
// or lesson text: everything flows through src/content/courseSource.ts.

import type React from 'react'
import PenUnderline from './PenUnderline'
import HandDrawnSketches from './HandDrawnSketches'
import PendulumSim from '../simulations/PendulumSim'
import WaveSim from '../simulations/WaveSim'
import { getCourses, getCourseById, IS_FILLER_CONTENT } from '../content/courseSource'
import type { Course } from '../content/types'

/** Where the app can be. View state lives in App.tsx (currentView) — no router dependency. */
export type View = { page: 'home' } | { page: 'course'; id: string }

/** Ink button with paper text; min 44px tap target. One primary action per section. */
export function Button({
  as = 'button',
  href,
  onClick,
  children,
  variant = 'primary',
  type = 'button',
}: {
  as?: 'button' | 'a'
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'quiet'
  type?: 'button' | 'submit'
}) {
  const cls =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-pen-blue'
      : 'border border-ink/70 bg-transparent text-ink hover:border-pen-blue hover:text-pen-blue'
  const shared = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm px-5 py-3 font-notes text-sm font-bold tracking-wide transition-colors duration-150 ${cls}`
  if (as === 'a') {
    return (
      <a href={href} onClick={onClick} className={shared}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={shared}>
      {children}
    </button>
  )
}

/** Section wrapper: max-w-6xl, px-6, py-20, hairline top border separating sections. */
export function Section({
  id,
  title,
  kicker,
  children,
  bordered = true,
  labelBy,
}: {
  id?: string
  title?: string
  kicker?: string
  children: React.ReactNode
  bordered?: boolean
  labelBy?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelBy}
      className={`mx-auto w-full max-w-6xl px-6 py-20 ${bordered ? 'border-t border-ink/25' : ''}`}
    >
      {title && (
        <div className="mb-10">
          {kicker && (
            <p className="font-notes text-xs font-bold uppercase tracking-[0.18em] text-graphite">{kicker}</p>
          )}
          <h2 id={labelBy} className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            <PenUnderline>{title}</PenUnderline>
          </h2>
        </div>
      )}
      {children}
    </section>
  )
}

/** Small typed-note tag, e.g. "Class 9 · Ch 8". Square corners, graphite. Not a pill. */
export function MetaTag({ children }: { children: React.ReactNode }) {
  return <span className="font-notes text-xs font-bold uppercase tracking-wide text-graphite">{children}</span>
}

/** The Caveat margin note with a hand arrow pointing back-left. Decorative (aria-hidden). */
export function MarginNote({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none inline-flex items-center gap-2 text-pen-blue ${className}`}>
      <svg viewBox="0 0 56 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-6 w-9 flex-none">
        <path d="M52 26 C34 28 16 22 8 5" />
        <path d="M8 5 L5 17 M8 5 L19 10" />
      </svg>
      <span className="font-hand text-xl leading-none">{children}</span>
    </span>
  )
}

/** Gentle fade-in on mount; CSS disables it under prefers-reduced-motion. */
export function FadeIn({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export function Header({ go }: { go: (v: View) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/25 bg-paper/95 backdrop-blur-[1px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault()
            go({ page: 'home' })
          }}
          className="min-h-[44px] font-display text-xl font-extrabold tracking-tight text-ink"
          aria-label="Zivon home"
        >
          Zivon<span className="text-pen-blue">.</span>
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {[
            { label: 'Topics', target: '#topics' },
            { label: 'How it works', target: '#how' },
            { label: 'About', target: '#about' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.target}
              onClick={(e) => {
                e.preventDefault()
                go({ page: 'home' })
                // let the view swap render, then scroll to the anchor
                requestAnimationFrame(() => document.querySelector(l.target)?.scrollIntoView({ block: 'start' }))
              }}
              className="min-h-[44px] rounded-sm px-3 py-3 font-notes text-sm text-graphite transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Button onClick={() => { go({ page: 'home' }); requestAnimationFrame(() => document.querySelector('#topics')?.scrollIntoView({ block: 'start' })) }}>
          Start exploring
        </Button>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="border-t border-ink/25">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-notes text-xs text-graphite">
          Zivon — physics, Class 9–12. Built for the Great Indian AI Internship Challenge, on Gnani models.
        </p>
        <p className="font-notes text-xs text-graphite">NCERT-aligned · no sign-up needed</p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Topic card (used by the landing grid; varied weights via `size`)    */
/* ------------------------------------------------------------------ */

function CourseCard({ course, go, size }: { course: Course; go: (v: View) => void; size: 'wide' | 'normal' }) {
  const open = () => go({ page: 'course', id: course.id })
  return (
    <article className={size === 'wide' ? 'sm:col-span-2' : ''}>
      <a
        href={`#/course/${course.id}`}
        onClick={(e) => {
          e.preventDefault()
          open()
        }}
        aria-label={`Open course: ${course.title}`}
        className="group flex h-full min-h-[44px] flex-col justify-between gap-4 rounded-sm border border-ink/70 bg-paper-light p-5 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 sm:p-6"
      >
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {course.classLevel && <MetaTag>{course.classLevel}</MetaTag>}
            {course.chapterTag && <MetaTag>{course.chapterTag}</MetaTag>}
          </div>
          <h3 className={`font-extrabold leading-snug ${size === 'wide' ? 'text-2xl sm:text-[1.7rem]' : 'text-xl'}`}>
            {course.title}
          </h3>
          {course.summary && <p className="mt-2 text-[15px] leading-relaxed text-graphite">{course.summary}</p>}
        </div>
        <div className="flex items-end justify-between gap-4">
          {course.equation ? (
            <p className="font-notes text-sm font-bold text-ink">{course.equation}</p>
          ) : (
            <span />
          )}
          {course.sketch ? (
            <HandDrawnSketches sketch={course.sketch} className={`h-16 flex-none opacity-80 transition-opacity group-hover:opacity-100 ${size === 'wide' ? 'w-28 sm:w-32' : 'w-24'}`} />
          ) : null}
        </div>
      </a>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Home (landing)                                                      */
/* ------------------------------------------------------------------ */

export function Home({ go }: { go: (v: View) => void }) {
  const courses = getCourses()
  // first card spans two columns on wide screens → varied visual weight, never three clones
  return (
    <main id="main">
      <FadeIn>
        {/* HERO — asymmetric 7:5 */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-16 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-7">
            <h1 className="max-w-[14ch] text-[clamp(2.4rem,6.5vw,4.2rem)] font-extrabold leading-[1.05]">
              Physics, explained like a friend would.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-graphite">
              Short lessons, sketches you can poke at, and a tutor you can talk to. Class 9 to 12.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => {
                  const first = courses[0]
                  if (first) go({ page: 'course', id: first.id })
                  else document.querySelector('#topics')?.scrollIntoView({ block: 'start' })
                }}
              >
                Start exploring
              </Button>
              <a
                href="#how"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#how')?.scrollIntoView({ block: 'start' })
                }}
                className="inline-flex min-h-[44px] items-center font-notes text-sm text-graphite underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
              >
                how it works first?
              </a>
            </div>
          </div>
          <div className="relative flex items-center md:col-span-5">
            {/* notebook page corner: one taped card, slight rotation (doctrine: max 1.5deg, one element) */}
            <div className="w-full rotate-[1.2deg] rounded-sm border border-ink/70 bg-paper-light p-6">
              <HandDrawnSketches sketch="pendulum" className="h-40 w-full" />
              <p className="mt-4 font-notes text-xs text-graphite">T = 2π√(L/g) — drag the bob below, on the pendulum page</p>
              <MarginNote className="mt-3 -rotate-2">this one is real</MarginNote>
            </div>
          </div>
        </section>

        {/* EXPLORE BY TOPIC — reads ONLY from courseSource */}
        <Section id="topics" kicker="Explore by topic" title="Pick where you want to start" labelBy="topics-h">
          {courses.length === 0 ? (
            <p className="max-w-md text-lg leading-relaxed text-graphite">
              Nothing here yet. Courses are being written right now — check back soon.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c, i) => (
                  <CourseCard key={c.id} course={c} go={go} size={i === 0 ? 'wide' : 'normal'} />
                ))}
              </div>
              {IS_FILLER_CONTENT && (
                <p className="mt-8">
                  <MarginNote>sample topics for now, real courses coming</MarginNote>
                  <span className="sr-only">These are sample topics. Real courses are coming soon.</span>
                </p>
              )}
            </>
          )}
        </Section>

        {/* HOW IT WORKS — three quiet numbered steps, no icon circles */}
        <Section id="how" kicker="How it works" title="Three steps, that's the whole method" labelBy="how-h">
          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              { n: '01', t: 'Read the short version', d: 'One page per idea. Plain words, one formula, a sketch. Five minutes, not fifty.' },
              { n: '02', t: 'Play with the sim', d: 'Drag the bob. Move the sliders. Change one thing and watch what breaks — that is the lesson.' },
              { n: '03', t: 'Ask out loud when stuck', d: 'Press the mic and ask in Hindi, English, or mixed. The tutor sees your screen and explains step by step.' },
            ].map((s) => (
              <li key={s.n} className="border-t-2 border-ink/70 pt-4">
                <p className="font-notes text-sm font-bold text-pen-blue">{s.n}</p>
                <h3 className="mt-2 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-md text-sm leading-relaxed text-graphite">
            Step 3 is being wired up right now — the voice tutor lands with the Gnani stack this week.
          </p>
        </Section>

        {/* ABOUT — short and honest */}
        <Section id="about" kicker="About" title="What Zivon is, and isn't" labelBy="about-h">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="space-y-4 text-[17px] leading-relaxed md:col-span-7">
              <p>
                Zivon teaches the physics your syllabus actually covers — NCERT, Class 9 to 12 — one topic per page,
                each built from official material and checked for accuracy before it goes live.
              </p>
              <p>
                It isn't a video marathon or an answer bot. You read a little, touch a simulation, and ask questions
                out loud when something doesn't land. That loop is the whole product.
              </p>
            </div>
            <ul className="list-none space-y-3 md:col-span-5">
              {[
                { ok: true, t: 'Built from NCERT and public-domain sources' },
                { ok: true, t: 'Works on a cheap phone, no sign-up' },
                { ok: false, t: 'Not exam predictions, not shortcuts' },
              ].map((r) => (
                <li key={r.t} className="flex items-start gap-3 border-t border-ink/25 pt-3 text-[15px] leading-snug">
                  <span aria-hidden="true" className={`mt-0.5 font-notes font-bold ${r.ok ? 'text-tick-green' : 'text-pencil-red'}`}>
                    {r.ok ? '✓' : '✗'}
                  </span>
                  {r.t}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* CLOSING CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 text-left">
          <div className="border-t border-ink/25 pt-16">
            <h2 className="max-w-[20ch] text-3xl font-extrabold leading-tight sm:text-4xl">
              Pick a topic. Start with the one that's due next week.
            </h2>
            <div className="mt-8">
              <Button onClick={() => document.querySelector('#topics')?.scrollIntoView({ block: 'start' })}>
                Browse topics
              </Button>
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* CoursePage — renders ANY Course matching the schema                 */
/* ------------------------------------------------------------------ */

// Interactive rigs are mounted by the Course.simulation key, never by importing
// rig code into the page per-topic. Add a rig = add one line here + one key type.
const SIMS: Record<string, React.ComponentType> = {
  pendulum: PendulumSim,
  wave: WaveSim,
}

export function CoursePage({ id, go }: { id: string; go: (v: View) => void }) {
  const course = getCourseById(id)

  if (!course) {
    // unknown id — plain friendly message, no broken layout
    return (
      <main id="main" className="mx-auto w-full max-w-6xl px-6 py-20">
        <FadeIn>
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); go({ page: 'home' }) }}
            className="inline-flex min-h-[44px] items-center font-notes text-sm text-graphite transition-colors hover:text-ink"
          >
            ← Back to Overview
          </a>
          <h1 className="mt-8 text-3xl font-extrabold sm:text-4xl">We haven't written that one yet.</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
            This topic isn't in the library. Head back and pick another — there's always one you need anyway.
          </p>
          <div className="mt-8">
            <Button onClick={() => go({ page: 'home' })}>Browse topics</Button>
          </div>
        </FadeIn>
      </main>
    )
  }

  const lessons = course.lessons ?? []
  const Sim = course.simulation ? SIMS[course.simulation] : undefined

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
      <FadeIn>
        <nav aria-label="Breadcrumb">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); go({ page: 'home' }) }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-sm font-notes text-sm text-graphite transition-colors hover:text-ink"
          >
            ← Back to Overview
          </a>
        </nav>

        {/* header block: title + tags + summary, sketch beside it on wide screens */}
        <div className="mt-6 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {course.classLevel && <MetaTag>{course.classLevel}</MetaTag>}
              {course.chapterTag && <MetaTag>{course.chapterTag}</MetaTag>}
            </div>
            <h1 className="mt-3 text-[clamp(1.9rem,5vw,3rem)] font-extrabold leading-[1.08]">
              <PenUnderline>{course.title}</PenUnderline>
            </h1>
            {course.summary ? (
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-graphite">{course.summary}</p>
            ) : (
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-graphite">
                No summary for this one yet. The lessons below still count.
              </p>
            )}
            {course.equation && (
              <p className="mt-6 inline-block border-l-2 border-pen-blue pl-4 font-notes text-base font-bold text-ink">
                {course.equation}
              </p>
            )}
          </div>
          <div className="flex items-center md:col-span-5">
            {course.sketch && <HandDrawnSketches sketch={course.sketch} className="mx-auto h-36 w-full max-w-[300px]" />}
          </div>
        </div>

        {/* lessons / sections — from the data layer only */}
        <section aria-labelledby="lessons-h" className="mt-14 border-t border-ink/25 pt-10">
          <h2 id="lessons-h" className="font-notes text-xs font-bold uppercase tracking-[0.18em] text-graphite">
            What's inside
          </h2>
          {lessons.length === 0 ? (
            <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
              Lessons for this topic are still being written. Come back a little later — the page will fill itself in.
            </p>
          ) : (
            <ol className="mt-6 list-none space-y-0 p-0">
              {lessons.map((l, i) => (
                <li key={l.id} className="flex items-start gap-4 border-t border-dashed border-ink/30 py-4">
                  <span className="w-10 flex-none pt-0.5 font-notes text-sm font-bold text-graphite" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-bold leading-snug">{l.title}</h3>
                    {l.summary && <p className="mt-1 text-[15px] leading-relaxed text-graphite">{l.summary}</p>}
                  </div>
                  {l.status === 'done' && (
                    <span className="flex-none pt-0.5 font-notes text-xs font-bold text-tick-green">
                      ✓ done
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-8">
            <Button
              onClick={() => {
                const el = document.querySelector('#rig')
                if (el) el.scrollIntoView({ block: 'center' })
                else document.querySelector('#lessons-h')?.scrollIntoView({ block: 'start' })
              }}
            >
              Start this lesson
            </Button>
            {!Sim && lessons.length > 0 && (
              <p className="mt-3 text-sm text-graphite">The interactive part for this topic is still in the workshop — read through the sections above for now.</p>
            )}
          </div>
        </section>

        {/* interactive rig, if the course carries one */}
        {Sim && (
          <section id="rig" aria-label="Interactive simulation" className="mt-14 border-t border-ink/25 pt-10">
            <h2 className="font-notes text-xs font-bold uppercase tracking-[0.18em] text-graphite">Try it yourself</h2>
            <div className="mt-6 max-w-xl">
              <Sim />
            </div>
          </section>
        )}

        {/* bottom back link — students can always get back */}
        <div className="mt-14 border-t border-ink/25 pt-8">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); go({ page: 'home' }) }}
            className="inline-flex min-h-[44px] items-center font-notes text-sm text-graphite transition-colors hover:text-ink"
          >
            ← Back to all topics
          </a>
        </div>
      </FadeIn>
    </main>
  )
}
