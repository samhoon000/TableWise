import { Link } from 'react-router-dom'

export function PlaceholderPage({ title, description }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          {description ?? 'This screen is UI-only in the demo—no account or data is stored.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
