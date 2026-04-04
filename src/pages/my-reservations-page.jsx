import { useState } from 'react'
import { Link } from 'react-router-dom'

const inputCls =
  'mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20'

const MOCK_RESERVATIONS = [
  {
    id: 1,
    restaurant: 'The Saffron Room',
    date: '2026-04-08',
    time: '7:00 PM – 9:00 PM',
    guests: 2,
    table: 'T3',
    status: 'Confirmed',
  },
  {
    id: 2,
    restaurant: 'Osteria Nove',
    date: '2026-04-12',
    time: '8:00 PM – 10:00 PM',
    guests: 4,
    table: 'T1',
    status: 'Confirmed',
  },
  {
    id: 3,
    restaurant: 'Coastal Plate',
    date: '2026-03-20',
    time: '12:30 PM – 2:00 PM',
    guests: 3,
    table: 'T5',
    status: 'Completed',
  },
]

/* ─── Auth Card (Login / Sign Up) ─── */
function AuthCard({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  // Login state
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [loginErr, setLoginErr] = useState('')

  // Signup state
  const [signupName, setSignupName] = useState('')
  const [signupId, setSignupId] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupErr, setSignupErr] = useState('')
  const [signupOk, setSignupOk] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!loginId.trim() || !loginPw.trim()) {
      setLoginErr('Please fill in all fields.')
      return
    }
    setLoginErr('')
    onLogin(loginId.trim())
  }

  const handleSignup = (e) => {
    e.preventDefault()
    if (!signupName.trim() || !signupId.trim() || !signupPw || !signupConfirm) {
      setSignupErr('Please fill in all fields.')
      return
    }
    if (signupPw !== signupConfirm) {
      setSignupErr('Passwords do not match.')
      return
    }
    if (signupPw.length < 6) {
      setSignupErr('Password must be at least 6 characters.')
      return
    }
    setSignupErr('')
    setSignupOk(true)
  }

  const switchTo = (m) => {
    setMode(m)
    setLoginErr('')
    setSignupErr('')
    setSignupOk(false)
  }

  const isLogin = mode === 'login'

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_1px_3px_rgb(0_0_0/0.06),0_12px_28px_rgb(0_0_0/0.06)] sm:p-8">
        {/* ── Login ── */}
        {isLogin && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-900">Welcome back</h2>
            <p className="text-sm text-stone-600">Log in to view and manage your reservations.</p>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Email or Phone</span>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputCls}
              />
            </label>

            {loginErr && <p className="text-sm font-medium text-red-600">{loginErr}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 active:scale-[0.99]"
            >
              Login
            </button>

            <p className="text-center text-sm text-stone-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchTo('signup')}
                className="font-semibold text-teal-800 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* ── Sign Up ── */}
        {!isLogin && !signupOk && (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-900">Create an account</h2>
            <p className="text-sm text-stone-600">Sign up to start making reservations.</p>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Name</span>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Email or Phone</span>
              <input
                type="text"
                value={signupId}
                onChange={(e) => setSignupId(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Confirm Password</span>
              <input
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={inputCls}
              />
            </label>

            {signupErr && <p className="text-sm font-medium text-red-600">{signupErr}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 active:scale-[0.99]"
            >
              Sign Up
            </button>

            <p className="text-center text-sm text-stone-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchTo('login')}
                className="font-semibold text-teal-800 hover:underline"
              >
                Login
              </button>
            </p>
          </form>
        )}

        {/* ── Signup success ── */}
        {!isLogin && signupOk && (
          <div className="text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-lg">
              ✓
            </div>
            <h2 className="mt-4 text-xl font-semibold text-stone-900">Account created!</h2>
            <p className="mt-2 text-sm text-stone-600">
              You can now log in with your credentials.
            </p>
            <button
              type="button"
              onClick={() => switchTo('login')}
              className="mt-6 inline-flex rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Reservation Dashboard (shown after login) ─── */
function ReservationDashboard({ user, onLogout }) {
  const upcoming = MOCK_RESERVATIONS.filter((r) => r.status === 'Confirmed')
  const past = MOCK_RESERVATIONS.filter((r) => r.status === 'Completed')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">My Reservations</h1>
          <p className="mt-1 text-sm text-stone-600">
            Logged in as <span className="font-medium text-stone-800">{user}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/restaurants"
            className="inline-flex items-center rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Browse restaurants
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success banner */}
      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm font-medium text-teal-800">
        ✓ Login successful — Welcome back!
      </div>

      {/* Upcoming */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500 italic">No upcoming reservations.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-stone-900">{r.restaurant}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {new Date(r.date + 'T12:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {r.time}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-500">
                    Table {r.table} · {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Past</h2>
        {past.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500 italic">No past reservations.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {past.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-stone-700">{r.restaurant}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {new Date(r.date + 'T12:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {r.time}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-400">
                    Table {r.table} · {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-600">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/* ─── Page ─── */
export function MyReservationsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState('')

  const handleLogin = (identifier) => {
    setUser(identifier)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser('')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <AuthCard onLogin={handleLogin} />
  }

  return <ReservationDashboard user={user} onLogout={handleLogout} />
}
