import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/use-admin-auth.js'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(email, password)
    if (result.ok) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(result.error ?? 'Unable to sign in.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-xl font-semibold text-stone-900">Restaurant owner login</h1>
        <p className="mt-2 text-sm text-stone-600">
          Sign in with a verified partner account. Demo: <span className="font-mono text-xs">owner@saffron.example</span> /{' '}
          <span className="font-mono text-xs">demo123</span>
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
          >
            Log in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">
          <Link to="/admin/register" className="font-semibold text-teal-800 hover:underline">
            Register your restaurant
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link to="/" className="text-sm text-stone-500 hover:text-teal-800">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
