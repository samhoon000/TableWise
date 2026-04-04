import { useState } from 'react'
import { Link } from 'react-router-dom'

const initial = {
  restaurantName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  cuisine: '',
  capacity: '',
}

export function AdminRegisterPage() {
  const [form, setForm] = useState(initial)
  const [submitted, setSubmitted] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-teal-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800">✓</div>
          <h1 className="mt-6 text-xl font-semibold text-stone-900">Application received</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Your application is being processed. We will get in touch with you.
          </p>
          <Link
            to="/admin/login"
            className="mt-8 inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-xl font-semibold text-stone-900">Register your restaurant</h1>
        <p className="mt-2 text-sm text-stone-600">
          Partner onboarding form—mirrors real marketplace flows (no data is saved in this demo).
        </p>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Restaurant name</span>
            <input
              required
              value={form.restaurantName}
              onChange={update('restaurantName')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Owner name</span>
            <input
              required
              value={form.ownerName}
              onChange={update('ownerName')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Phone number</span>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={update('phone')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Restaurant address</span>
            <input
              required
              value={form.address}
              onChange={update('address')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">City</span>
            <input
              required
              value={form.city}
              onChange={update('city')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Cuisine type</span>
            <input
              required
              value={form.cuisine}
              onChange={update('cuisine')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Seating capacity</span>
            <input
              required
              type="number"
              min={1}
              value={form.capacity}
              onChange={update('capacity')}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Restaurant images (UI only)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1.5 w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-800"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">Business license / proof (UI only)</span>
            <input
              type="file"
              accept=".pdf,image/*"
              className="mt-1.5 w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-800"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 sm:w-auto sm:px-8"
            >
              Submit application
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/admin/login" className="font-semibold text-teal-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
