// App shell — view state (currentView) + hash routing, no router dependency.
// #/            → landing page
// #/course/<id> → course content page (renders any Course from the data layer)

import { useCallback, useEffect, useState } from 'react'
import { Header, Footer, Home, CoursePage, type View } from './components/ZivonUI'

/** Parse location.hash into a View. Unknown hashes fall back to home. */
function viewFromHash(): View {
  const m = window.location.hash.match(/^#\/course\/([^/?#]+)/)
  if (m) return { page: 'course', id: decodeURIComponent(m[1]) }
  return { page: 'home' }
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(viewFromHash)

  // keep view and URL in sync (back/forward buttons work for free)
  useEffect(() => {
    const onHash = () => setCurrentView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((v: View) => {
    window.location.hash = v.page === 'home' ? '#/' : `#/course/${encodeURIComponent(v.id)}`
    setCurrentView(v)
    if (v.page === 'home') window.scrollTo({ top: 0 })
    else window.scrollTo({ top: 0 })
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:font-notes focus:text-paper"
      >
        Skip to content
      </a>
      <Header go={go} />
      {currentView.page === 'home' ? <Home go={go} key="home" /> : <CoursePage id={currentView.id} go={go} key={currentView.id} />}
      <Footer />
    </>
  )
}

