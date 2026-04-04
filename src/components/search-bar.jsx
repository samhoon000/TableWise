import { useMemo, useState } from 'react'

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8]

function defaultDate() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function SearchBar({
  variant = 'hero',
  onSearch,
  initialLocation = '',
  compact = false,
}) {
  const [location, setLocation] = useState(initialLocation)
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('7:00 PM')
  const [guests, setGuests] = useState(2)

  const timeOptions = useMemo(
    () => [
      '12:00 PM',
      '12:30 PM',
      '1:00 PM',
      '1:30 PM',
      '2:00 PM',
      '6:00 PM',
      '6:30 PM',
      '7:00 PM',
      '7:30 PM',
      '8:00 PM',
      '8:30 PM',
      '9:00 PM',
      '9:30 PM',
      '10:00 PM',
    ],
    [],
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.({ location, date, time, guests: Number(guests) })
  }

  const shell =
    variant === 'hero'
      ? 'rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_1px_3px_rgb(0_0_0/0.06),0_12px_28px_rgb(0_0_0/0.08)] backdrop-blur-md sm:p-5'
      : 'rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5'

  const grid = compact
    ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end'
    : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end'

  return (
    <form onSubmit={handleSubmit} className={shell}>
      <div className={grid}>
        <label className="block lg:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Neighbourhood, city"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-teal-600/0 transition placeholder:text-stone-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-teal-600/0 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Time</span>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-teal-600/0 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-teal-600/0 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
          >
            {guestOptions.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2 lg:col-span-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-700/30 transition hover:bg-teal-600 hover:shadow-lg active:scale-[0.99] lg:py-2.5"
          >
            Search restaurants
          </button>
        </div>
      </div>
    </form>
  )
}
