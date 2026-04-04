import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-800">Tablewise</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
              Book tables at great restaurants. Real-time availability patterns you already know from leading reservation
              platforms.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>
                <Link to="/" className="transition hover:text-teal-700">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="transition hover:text-teal-700">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/my-reservations" className="transition hover:text-teal-700">
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">For restaurants</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>
                <a href="#" className="transition hover:text-teal-700">
                  List your restaurant
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-teal-700">
                  Partner support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>help@tablewise.example</li>
              <li>+91 80 4000 1200</li>
              <li className="text-stone-500">Mon–Sun, 9:00 AM – 8:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Tablewise. Demo application.</p>
          <div className="flex flex-wrap gap-4 text-xs text-stone-500">
            <a href="#" className="hover:text-teal-700">
              Privacy
            </a>
            <a href="#" className="hover:text-teal-700">
              Terms
            </a>
            <a href="#" className="hover:text-teal-700">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
