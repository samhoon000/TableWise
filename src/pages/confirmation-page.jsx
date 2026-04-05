import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import data from '../data/restaurants.json'
import { formatRupees } from '../lib/booking-price.js'
import { useVenueStore } from '../hooks/use-venue-store.js'

function formatDisplayDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

/** Ensures fetch returned a usable reservation document from the API. */
function parseReservationPayload(raw) {
  if (!raw || typeof raw !== 'object') return null
  const oid = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : ''
  if (!oid.trim() || raw.restaurantId == null || raw.tableId == null) return null
  return raw
}

export function ConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getTables } = useVenueStore()
  const paymentMethodLabel = location.state?.paymentMethodLabel

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    if (!id || !String(id).trim()) {
      navigate('/restaurants', { replace: true })
      return
    }

    const reservationId = String(id).trim()
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError('')
      setBooking(null)
      try {
        const res = await fetch(`/api/reservations/booking/${encodeURIComponent(reservationId)}`)
        const body = await res.json().catch(() => null)

        if (!res.ok) {
          const msg =
            body && typeof body === 'object'
              ? body.message || body.error
              : null
          throw new Error(typeof msg === 'string' && msg.trim() ? msg : 'Reservation not found')
        }

        const parsed = parseReservationPayload(body)
        if (!parsed) {
          throw new Error('Received incomplete reservation data. Please refresh or contact support.')
        }
        if (!cancelled) setBooking(parsed)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Something went wrong.')
          setBooking(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  if (!id || !String(id).trim()) {
    return null
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent"
              aria-hidden
            />
          </div>
          <h1 className="mt-6 text-lg font-semibold text-stone-900">Loading your booking…</h1>
          <p className="mt-2 text-sm text-stone-600">
            We&apos;re loading your confirmation, table details, and verification token from the database.
          </p>
          <p className="mt-1 font-mono text-xs text-stone-400">ID: {String(id).trim()}</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-lg font-semibold text-red-900">We couldn&apos;t load this reservation</h1>
          <p className="mt-2 text-sm text-red-800">{error || 'Reservation not found.'}</p>
          <Link
            to="/restaurants"
            className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Browse restaurants
          </Link>
        </div>
      </div>
    )
  }

  const restaurantName = data.restaurants.find((r) => r.id === booking.restaurantId)?.name ?? booking.restaurantId
  const tableMeta = getTables(booking.restaurantId).find((t) => t.id === booking.tableId)
  const tableLabel = tableMeta ? tableMeta.displayName || tableMeta.id : booking.tableId
  const tableSeats = tableMeta?.seats
  const windowLabel = `${booking.startTime ?? '—'} – ${booking.endTime ?? '—'}`

  const hasToken = booking.token != null && String(booking.token).trim() !== ''
  const tokenDisplay = hasToken ? String(booking.token).trim() : '—'

  const isPaid = booking.status === 'confirmed' || booking.status === 'booked'

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-2xl border border-teal-100 bg-white p-8 text-center shadow-[0_1px_3px_rgb(0_0_0/0.06),0_12px_28px_rgb(0_0_0/0.06)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl text-teal-800">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-stone-900">You&apos;re Booked!</h1>
        <p className="mt-2 text-sm text-stone-600">
          Details below are loaded from your saved reservation. You can refresh this page anytime.
        </p>

        <div
          className="mx-auto mt-8 max-w-xs rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100/90 px-6 py-5 shadow-inner shadow-amber-900/5"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-amber-900/80">Verification token</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.2em] text-amber-950 tabular-nums">{tokenDisplay}</p>
          {!hasToken ? (
            <p className="mt-2 text-xs text-amber-900/70">No token on file for this reservation.</p>
          ) : null}
        </div>

        {isPaid ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-900">
            <p className="font-semibold">Payment confirmed</p>
            <p className="mt-1 text-emerald-800/95">Your payment was successful. A receipt has been sent to your email.</p>
            {paymentMethodLabel ? (
              <p className="mt-2 text-xs text-emerald-800/80">Paid via {paymentMethodLabel}</p>
            ) : null}
            {booking.totalPrice != null ? (
              <p className="mt-2 text-lg font-bold text-emerald-950">Amount paid: {formatRupees(booking.totalPrice)}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 rounded-xl border border-stone-100 bg-stone-50/90 p-5 text-left text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reservation details</p>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Status</dt>
              <dd className="text-right font-medium text-stone-900">{booking.status ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Restaurant</dt>
              <dd className="text-right font-medium text-stone-900">{restaurantName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Guest name</dt>
              <dd className="text-right font-medium text-stone-900">{booking.userName ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Email</dt>
              <dd className="break-all text-right font-medium text-stone-900">{booking.userEmail ?? '—'}</dd>
            </div>
            {booking.tableId ? (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Table</dt>
                <dd className="text-right font-medium text-stone-900">
                  {tableLabel}
                  {tableSeats ? ` · ${tableSeats} seats` : ''}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Date</dt>
              <dd className="text-right font-medium text-stone-900">{formatDisplayDate(booking.date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Time</dt>
              <dd className="text-right font-medium text-stone-900">{windowLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Guests</dt>
              <dd className="text-right font-medium text-stone-900">
                {booking.guests ?? 1} {(booking.guests ?? 1) === 1 ? 'guest' : 'guests'}
              </dd>
            </div>
            {booking.totalPrice != null ? (
              <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
                <dt className="text-stone-500">Booking total</dt>
                <dd className="text-right font-semibold text-teal-900">{formatRupees(booking.totalPrice)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/restaurants"
            className="inline-flex justify-center rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Find more tables
          </Link>
          <Link
            to="/"
            className="inline-flex justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
