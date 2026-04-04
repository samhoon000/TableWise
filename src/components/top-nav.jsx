import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SideDrawer } from './side-drawer.jsx'

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-stone-900 transition hover:text-teal-800"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white shadow-md shadow-teal-700/25"
              aria-hidden
            >
              TW
            </span>
            <span className="hidden sm:inline">Tablewise</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/60"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </header>
      <SideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
