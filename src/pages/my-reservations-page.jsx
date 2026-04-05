import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../data/restaurants.json'
import { formatRupees } from '../lib/booking-price.js'
import { getStoredReservationIds, setStoredReservationIds } from '../lib/stored-reservation-ids.js'
import { useVenueStore } from '../hooks/use-venue-store.js'

function formatDisplayDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function MyReservationsPage() {
  const { getTables, syncRestaurant } = useVenueStore()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [rows, setRows] = useState([])

  const loadReservations = useCallback(async () => {
    const ids = getStoredReservationIds()
    if (ids.length === 0) {
      setRows([])
      setLoadError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/reservations/by-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const body = await res.json().catch(() => null)

      if (!res.ok) {
        const msg =
          body && typeof body === 'object' ? body.message || body.error : null
        throw new Error(typeof msg === 'string' && msg.trim() ? msg : 'Could not load reservations.')
      }

      const reservations = Array.isArray(body?.reservations) ? body.reservations : []
      const missingIds = Array.isArray(body?.missingIds) ? body.missingIds : []
      const invalidIds = Array.isArray(body?.invalidIds) ? body.invalidIds : []
      const drop = new Set([...missingIds, ...invalidIds].map(String))

      if (drop.size > 0) {
        const keep = getStoredReservationIds().filter((id) => !drop.has(String(id)))
        setStoredReservationIds(keep)
      }

      const restaurantIds = [...new Set(reservations.map((r) => r.restaurantId).filter(Boolean))]
      await Promise.all(restaurantIds.map((rid) => syncRestaurant(rid).catch(() => {})))

      setRows(reservations)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Something went wrong.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [syncRestaurant])

  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  const storedCount = getStoredReservationIds().length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">My Reservations</h1>
          <p className="mt-1 text-sm text-stone-600">
            Bookings on this device are remembered automatically—no account or email required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadReservations()}
            disabled={loading}
            className="inline-flex items-center rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            Refresh
          </button>
          <Link
            to="/restaurants"
            className="inline-flex items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
          >
            Book a table
          </Link>
        </div>
      </div>

      {loadError ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</p>
      ) : null}

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-stone-600">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
          <p className="text-sm">Loading your saved reservations…</p>
        </div>
      ) : null}

      {!loading && storedCount === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-6 py-14 text-center">
          <p className="text-lg font-medium text-stone-800">No reservations yet</p>
          <p className="mt-2 text-sm text-stone-600">
            When you complete a booking on this browser, it will show up here automatically.
          </p>
          <Link
            to="/restaurants"
            className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Browse restaurants
          </Link>
        </div>
      ) : null}

      {!loading && storedCount > 0 && rows.length === 0 && !loadError ? (
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-10 text-center">
          <p className="font-medium text-amber-950">We couldn&apos;t load any reservation details</p>
          <p className="mt-2 text-sm text-amber-900/90">
            Saved IDs may be invalid or the server may be unavailable. Try refreshing, or book again to add a new
            reservation.
          </p>
        </div>
      ) : null}

      {!loading && rows.length > 0 ? (
        <ul className="mt-10 space-y-5">
          {rows.map((r) => {
            const oid = r._id != null ? String(r._id) : ''
            const restaurantName =
              data.restaurants.find((x) => x.id === r.restaurantId)?.name ?? r.restaurantId ?? '—'
            const tableMeta = r.restaurantId ? getTables(r.restaurantId).find((t) => t.id === r.tableId) : null
            const tableLabel = tableMeta ? tableMeta.displayName || tableMeta.id : r.tableId ?? '—'
            const timeLabel = r.startTime && r.endTime ? `${r.startTime} – ${r.endTime}` : '—'

            return (
              <li
                key={oid}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/60 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-900/75">Verification token</p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.12em] text-amber-950 tabular-nums">
                    {r.token && String(r.token).trim() ? String(r.token).trim() : '—'}
                  </p>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-semibold text-stone-900">{restaurantName}</p>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase text-stone-700">
                      {r.status ?? '—'}
                    </span>
                  </div>
                  <dl className="grid gap-2 text-stone-600 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-stone-500">Table</dt>
                      <dd className="font-medium text-stone-800">{tableLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-stone-500">Guests</dt>
                      <dd className="font-medium text-stone-800">
                        {r.guests ?? 1} {(r.guests ?? 1) === 1 ? 'guest' : 'guests'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-stone-500">Date &amp; time</dt>
                      <dd className="font-medium text-stone-800">
                        {formatDisplayDate(r.date)} · {timeLabel}
                      </dd>
                    </div>
                    {r.totalPrice != null ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-stone-500">Total</dt>
                        <dd className="font-semibold text-teal-800">{formatRupees(r.totalPrice)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {oid ? (
                    <Link
                      to={`/confirmation/${encodeURIComponent(oid)}`}
                      className="inline-flex text-sm font-semibold text-teal-800 hover:text-teal-950 hover:underline"
                    >
                      View full confirmation →
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
