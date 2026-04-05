import { useMemo, useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import data from '../data/restaurants.json'
import { formatRupees } from '../lib/booking-price.js'
import { useAdminAuth } from '../hooks/use-admin-auth.js'
import { useVenueStore } from '../hooks/use-venue-store.js'
import { TableFloorPlan } from '../components/table-floor-plan.jsx'

export function AdminDashboardPage() {
  const { session, isAuthenticated, logout } = useAdminAuth()
  const { setManualTableReserved, isManualReserved, addTable, removeTable, renameTable, reservationsForRestaurant, syncRestaurant, getTables } =
    useVenueStore()

  const restaurantId = session?.restaurantId ?? data.restaurants[0]?.id ?? ''
  const [adminPick, setAdminPick] = useState(null)
  const [newTableId, setNewTableId] = useState('')
  const [newSeats, setNewSeats] = useState(4)
  const [addMsg, setAddMsg] = useState('')
  const [renameInput, setRenameInput] = useState('')
  const [renameMsg, setRenameMsg] = useState('')
  const [tokenSearchInput, setTokenSearchInput] = useState('')
  const [tokenSearchApplied, setTokenSearchApplied] = useState('')
  const [detailReservation, setDetailReservation] = useState(null)

  const reservations = useMemo(() => reservationsForRestaurant(restaurantId), [reservationsForRestaurant, restaurantId])

  const reservationsGrouped = useMemo(() => {
    const groups = {}
    reservations.forEach((r) => {
      if (!groups[r.tableId]) groups[r.tableId] = []
      groups[r.tableId].push(r)
    })
    
    Object.keys(groups).forEach((tId) => {
      groups[tId].sort((a, b) => {
        if (a.entryTime < b.entryTime) return -1
        if (a.entryTime > b.entryTime) return 1
        return 0
      })
    })

    const sortedTableIds = Object.keys(groups).sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, '')) || 0
      const bNum = parseInt(b.replace(/\D/g, '')) || 0
      return aNum - bNum || a.localeCompare(b)
    })

    return { groups, sortedTableIds }
  }, [reservations])

  useEffect(() => {
    if (restaurantId) {
      syncRestaurant(restaurantId, tokenSearchApplied ? { token: tokenSearchApplied } : undefined)
    }
  }, [restaurantId, syncRestaurant, tokenSearchApplied])

  useEffect(() => {
    if (!detailReservation) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailReservation(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailReservation])

  const handleTokenSearch = (e) => {
    e.preventDefault()
    const t = tokenSearchInput.replace(/\D/g, '')
    setTokenSearchApplied(t)
  }

  const handleClearTokenSearch = () => {
    setTokenSearchInput('')
    setTokenSearchApplied('')
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleAddTable = (e) => {
    e.preventDefault()
    setAddMsg('')
    const ok = addTable(restaurantId, newTableId, newSeats)
    if (ok) {
      setNewTableId('')
      setNewSeats(4)
      setAddMsg('Table added.')
    } else {
      setAddMsg('Could not add table—check ID is unique.')
    }
  }

  const handleRemove = () => {
    if (!adminPick?.id) return
    removeTable(restaurantId, adminPick.id)
    setAdminPick(null)
  }

  const handleAdminSelect = (t) => {
    setAdminPick(t)
    setRenameInput(t.displayName || t.id)
    setRenameMsg('')
  }

  const handleRename = (e) => {
    e.preventDefault()
    if (!adminPick) return
    const newName = renameInput.trim()
    renameTable(restaurantId, adminPick.id, newName)
    setAdminPick({ ...adminPick, displayName: newName || adminPick.id })
    setRenameMsg('Name saved.')
    setTimeout(() => setRenameMsg(''), 2000)
  }

  const handleRemoveReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to remove this customer checkout?')) return
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })
      syncRestaurant(restaurantId)
    } catch (err) {
      console.error('Failed to remove reservation:', err)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Owner dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Signed in as {session?.displayName} ({session?.email})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center justify-center rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Table layout management</h2>
          <p className="mt-1 text-sm text-stone-600">
            Tap a table to select it, then mark it reserved or available. Green = available, red = manually held.
          </p>
          <div className="mt-6">
            <TableFloorPlan
              mode="admin"
              restaurantId={restaurantId}
              adminSelectedId={adminPick?.id}
              onAdminSelect={handleAdminSelect}
            />
          </div>
          {adminPick ? (
            <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-stone-100 bg-stone-50 p-4">
              <p className="w-full text-sm text-stone-600">
                Selected <span className="font-semibold text-stone-900">{adminPick.displayName || adminPick.id}</span> · {adminPick.seats} seats ·
                currently{' '}
                {isManualReserved(restaurantId, adminPick.id) ? (
                  <span className="font-medium text-red-700">reserved (manual)</span>
                ) : (
                  <span className="font-medium text-emerald-700">available</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setManualTableReserved(restaurantId, adminPick.id, true)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                Mark as reserved
              </button>
              <button
                type="button"
                onClick={() => setManualTableReserved(restaurantId, adminPick.id, false)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Mark as available
              </button>
            </div>
          ) : null}
        </section>

        <div className="space-y-8">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Add table</h2>
            <form onSubmit={handleAddTable} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-stone-600">Table ID</span>
                <input
                  value={newTableId}
                  onChange={(e) => setNewTableId(e.target.value)}
                  placeholder="e.g. T7"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-stone-600">Seats</span>
                <input
                  type="number"
                  min={1}
                  value={newSeats}
                  onChange={(e) => setNewSeats(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Add table
              </button>
              {addMsg ? <p className="text-xs text-stone-600">{addMsg}</p> : null}
            </form>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Rename table</h2>
            <p className="mt-1 text-xs text-stone-500">Select a table to give it a custom name (e.g. Window Seat 1).</p>
            <form onSubmit={handleRename} className="mt-4 space-y-3">
              <input
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                disabled={!adminPick}
                placeholder="Select a table first"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-500 disabled:bg-stone-50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!adminPick}
                className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rename table
              </button>
              {renameMsg ? <p className="text-xs text-teal-700">{renameMsg}</p> : null}
            </form>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Remove table</h2>
            <p className="mt-1 text-xs text-stone-500">Select a table on the floor, then remove it from the layout.</p>
            <button
              type="button"
              disabled={!adminPick}
              onClick={handleRemove}
              className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove selected table
            </button>
          </section>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-stone-900">Reservation overview</h2>
        <p className="mt-1 text-sm text-stone-600">
          Guest bookings grouped by table and sorted by time. Search by the numeric verification token to verify a walk-in or phone booking.
        </p>

        <form onSubmit={handleTokenSearch} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-xs font-medium text-stone-600">Find by verification token</span>
            <input
              value={tokenSearchInput}
              onChange={(e) => setTokenSearchInput(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 482913"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearTokenSearch}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Show all
            </button>
          </div>
        </form>
        {tokenSearchApplied ? (
          <p className="mt-2 text-xs text-stone-500">
            Filtering by token <span className="font-mono font-semibold text-stone-800">{tokenSearchApplied}</span>
            {reservations.length === 0 ? ' — no match in this restaurant.' : ` — ${reservations.length} match(es).`}
          </p>
        ) : null}

        {reservations.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">No reservations yet for this restaurant.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-8">
            {reservationsGrouped.sortedTableIds.map((tableId) => {
              const tableObj = getTables(restaurantId).find(t => t.id === tableId)
              const dName = tableObj ? (tableObj.displayName || tableId) : tableId

              return (
              <div key={tableId} className="overflow-hidden rounded-xl border border-stone-200 shadow-sm">
                <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
                  <h3 className="font-semibold text-stone-800">Table {dName}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap text-left text-sm text-stone-600">
                    <thead className="border-b border-stone-100 bg-white text-xs uppercase tracking-wider text-stone-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">S.No</th>
                        <th className="px-4 py-3 font-medium">Guest Details</th>
                        <th className="px-4 py-3 font-medium">Token</th>
                        <th className="px-4 py-3 font-medium">Date & Time</th>
                        <th className="px-4 py-3 font-medium text-right">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {reservationsGrouped.groups[tableId].map((r, index) => (
                        <tr key={r.id} className="transition-colors hover:bg-stone-50">
                          <td className="px-4 py-4 align-top font-medium text-stone-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <button
                              type="button"
                              onClick={() => setDetailReservation(r)}
                              className="text-left hover:underline"
                            >
                              <p className="font-medium text-stone-900">{r.guestName}</p>
                              <p className="text-xs text-stone-500">
                                {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
                              </p>
                            </button>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {r.token ? (
                              <span className="inline-block rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-amber-950">
                                {r.token}
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="font-medium text-stone-700">{r.date}</p>
                            <p className="text-xs text-stone-500">{r.entryTime} – {r.exitTime}</p>
                            {r.totalPrice != null && (
                              <p className="mt-1 text-xs font-semibold text-teal-700">{formatRupees(r.totalPrice)}</p>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top text-right">
                            <p className="mb-2 text-xs font-medium uppercase text-stone-500">{r.status ?? '—'}</p>
                            <button
                              type="button"
                              onClick={() => setDetailReservation(r)}
                              className="mb-2 mr-0 inline-flex rounded-md bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100"
                            >
                              Details
                            </button>
                            {restaurantId === 'saffron-room' ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveReservation(r.id)}
                                className="inline-flex items-center rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-red-50 hover:text-red-700"
                              >
                                Check-out
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-stone-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </section>

      {detailReservation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-detail-title"
          onClick={() => setDetailReservation(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="reservation-detail-title" className="text-lg font-semibold text-stone-900">
                Reservation details
              </h2>
              <button
                type="button"
                onClick={() => setDetailReservation(null)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                Close
              </button>
            </div>
            <div className="mt-5 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-900/80">Verification token</p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-[0.15em] text-amber-950 tabular-nums">
                {detailReservation.token || '—'}
              </p>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Guest</dt>
                <dd className="text-right font-medium text-stone-900">{detailReservation.guestName}</dd>
              </div>
              {detailReservation.userEmail ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Email</dt>
                  <dd className="break-all text-right font-medium text-stone-900">{detailReservation.userEmail}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Guests</dt>
                <dd className="text-right font-medium text-stone-900">{detailReservation.guests}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Table</dt>
                <dd className="text-right font-medium text-stone-900">
                  {getTables(restaurantId).find((t) => t.id === detailReservation.tableId)?.displayName ||
                    detailReservation.tableId}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Date</dt>
                <dd className="text-right font-medium text-stone-900">{detailReservation.date}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Time</dt>
                <dd className="text-right font-medium text-stone-900">
                  {detailReservation.entryTime} – {detailReservation.exitTime}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Status</dt>
                <dd className="text-right font-medium text-stone-900">{detailReservation.status ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Reservation ID</dt>
                <dd className="break-all text-right font-mono text-xs text-stone-700">{detailReservation.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  )
}
