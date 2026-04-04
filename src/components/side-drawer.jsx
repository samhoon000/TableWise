import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200',
    isActive
      ? 'bg-teal-50 text-teal-800'
      : 'text-stone-700 hover:bg-stone-100',
  ].join(' ')

export function SideDrawer({ open, onClose }) {
  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={[
          'fixed right-0 top-0 z-50 flex h-full w-[min(100%,320px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <span className="text-lg font-semibold text-stone-900">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4" onClick={onClose}>
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/restaurants" className={linkClass}>
            Restaurants
          </NavLink>
          <NavLink to="/my-reservations" className={linkClass}>
            My Reservations
          </NavLink>
          <NavLink to="/admin/login" className={linkClass}>
            Join as Admin
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
