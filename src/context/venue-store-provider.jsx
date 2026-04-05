import { useCallback, useMemo, useState, useEffect } from 'react'
import { getRestaurantExtras } from '../lib/get-restaurant-extras.js'
import { addStoredReservationId } from '../lib/stored-reservation-ids.js'
import { reservationOverlaps } from '../lib/time-range.js'
import { VenueContext } from './venue-context.js'

const STORAGE_KEY = 'tablewise-venue-state'

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function manualKey(restaurantId, tableId) {
  return `${restaurantId}::${tableId}`
}

export function VenueStoreProvider({ children }) {
  const [snapshot, setSnapshot] = useState(() => {
    const saved = loadPersisted()
    return {
      reservations: saved?.reservations ?? [],
      manualReserved: saved?.manualReserved ?? {},
      removedTableIds: saved?.removedTableIds ?? {},
      extraTables: saved?.extraTables ?? {},
      renamedTables: saved?.renamedTables ?? {},
    }
  })

  const setAndPersist = useCallback((updater) => {
    setSnapshot((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next)
      return next
    })
  }, [])

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const saved = JSON.parse(e.newValue)
          setSnapshot({
            reservations: saved?.reservations ?? [],
            manualReserved: saved?.manualReserved ?? {},
            removedTableIds: saved?.removedTableIds ?? {},
            extraTables: saved?.extraTables ?? {},
            renamedTables: saved?.renamedTables ?? {},
          })
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const getTables = useCallback(
    (restaurantId) => {
      const { tables: defaults } = getRestaurantExtras(restaurantId)
      const removed = new Set(snapshot.removedTableIds[restaurantId] ?? [])
      const extras = snapshot.extraTables[restaurantId] ?? []
      const renames = snapshot.renamedTables?.[restaurantId] ?? {}
      return [...defaults.filter((t) => !removed.has(t.id)), ...extras].map(t => ({
        ...t,
        displayName: renames[t.id] ?? t.id
      }))
    },
    [snapshot.extraTables, snapshot.removedTableIds, snapshot.renamedTables],
  )

  const isManualReserved = useCallback(
    (restaurantId, tableId) => snapshot.manualReserved[manualKey(restaurantId, tableId)] === true,
    [snapshot.manualReserved],
  )

  const hasBookingConflict = useCallback(
    (restaurantId, tableId, date, entryTime, exitTime, excludeId) => {
      return snapshot.reservations.some((r) => {
        if (r.restaurantId !== restaurantId || r.tableId !== tableId || r.date !== date) return false
        if (excludeId && r.id === excludeId) return false
        if (r.status === 'pending') return false
        if (r.status === 'cancelled') return false
        return reservationOverlaps(r.entryTime, r.exitTime, entryTime, exitTime)
      })
    },
    [snapshot.reservations],
  )

  const getTableUiStatus = useCallback(
    (restaurantId, tableId, date, entryTime, exitTime, selectedTableId) => {
      if (selectedTableId === tableId) return 'selected'
      if (isManualReserved(restaurantId, tableId)) return 'reserved'
      if (date && entryTime && exitTime && hasBookingConflict(restaurantId, tableId, date, entryTime, exitTime)) {
        return 'reserved'
      }
      return 'available'
    },
    [hasBookingConflict, isManualReserved],
  )

  const mapServerReservation = useCallback((r, restaurantNameFallback) => {
    const id = r._id?.toString?.() ?? r._id
    return {
      id,
      restaurantId: r.restaurantId,
      tableId: r.tableId,
      date: r.date,
      entryTime: r.startTime,
      exitTime: r.endTime,
      guestName: r.userName,
      userEmail: r.userEmail,
      guests: r.guests || 2,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt,
      token: r.token,
      status: r.status,
      holdExpiresAt: r.holdExpiresAt,
      restaurantName: restaurantNameFallback,
    }
  }, [])

  const createPaidReservation = useCallback(
    async (payload) => {
      const response = await fetch('/api/reservations/book-after-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: payload.restaurantId,
          tableId: payload.tableId,
          userName: payload.guestName,
          userEmail: payload.email || 'guest@example.com',
          date: payload.date,
          startTime: payload.entryTime,
          endTime: payload.exitTime,
          guests: payload.guests,
          totalPrice: payload.totalPrice,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const msg = data.message || data.error || 'Could not complete booking after payment.'
        throw new Error(typeof msg === 'string' ? msg : 'Could not complete booking after payment.')
      }
      const reservation = data.reservation
      const rawId = reservation?._id ?? reservation?.id
      if (rawId == null || String(rawId).trim() === '') {
        throw new Error('Invalid booking response from server.')
      }

      const mapped = mapServerReservation(reservation, payload.restaurantName)
      setAndPersist((prev) => ({
        ...prev,
        reservations: [...prev.reservations.filter((x) => x.id !== mapped.id), mapped],
      }))

      addStoredReservationId(String(rawId))

      return { reservation, reservationId: String(rawId) }
    },
    [mapServerReservation, setAndPersist],
  )

  const setManualTableReserved = useCallback(
    async (restaurantId, tableId, reserved) => {
      try {
        await fetch('/api/table-status', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId, tableId, isManualReserved: reserved })
        });
      } catch (err) {
        console.error("Failed to set manual check:", err);
      }

      const key = manualKey(restaurantId, tableId)
      setAndPersist((prev) => {
        const next = { ...prev.manualReserved }
        if (reserved) next[key] = true
        else delete next[key]
        return { ...prev, manualReserved: next }
      })
    },
    [setAndPersist],
  )

  const addTable = useCallback(
    (restaurantId, tableId, seats) => {
      const id = tableId.trim()
      if (!id) return false
      const existing = getTables(restaurantId)
      if (existing.some((t) => t.id === id)) return false
      setAndPersist((prev) => ({
        ...prev,
        extraTables: {
          ...prev.extraTables,
          [restaurantId]: [...(prev.extraTables[restaurantId] ?? []), { id, seats: Number(seats) || 2 }],
        },
      }))
      return true
    },
    [getTables, setAndPersist],
  )

  const removeTable = useCallback(
    (restaurantId, tableId) => {
      const { tables: defaults } = getRestaurantExtras(restaurantId)
      const isDefault = defaults.some((t) => t.id === tableId)
      setAndPersist((prev) => {
        if (isDefault) {
          const set = new Set(prev.removedTableIds[restaurantId] ?? [])
          set.add(tableId)
          return {
            ...prev,
            removedTableIds: { ...prev.removedTableIds, [restaurantId]: [...set] },
            extraTables: {
              ...prev.extraTables,
              [restaurantId]: (prev.extraTables[restaurantId] ?? []).filter((t) => t.id !== tableId),
            },
          }
        }
        return {
          ...prev,
          extraTables: {
            ...prev.extraTables,
            [restaurantId]: (prev.extraTables[restaurantId] ?? []).filter((t) => t.id !== tableId),
          },
        }
      })
    },
    [setAndPersist],
  )

  const renameTable = useCallback(
    async (restaurantId, tableId, newName) => {
      try {
        await fetch('/api/table-status', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId, tableId, displayName: newName })
        });
      } catch (err) {
        console.error("Failed to rename:", err);
      }

      setAndPersist((prev) => ({
        ...prev,
        renamedTables: {
          ...prev.renamedTables,
          [restaurantId]: {
            ...(prev.renamedTables?.[restaurantId] ?? {}),
            [tableId]: newName || tableId
          }
        }
      }))
    },
    [setAndPersist]
  )

  const reservationsForRestaurant = useCallback(
    (restaurantId) => snapshot.reservations.filter((r) => r.restaurantId === restaurantId),
    [snapshot.reservations],
  )

  const syncRestaurant = useCallback(async (restaurantId, options) => {
    if (!restaurantId) return;
    try {
      const tokenQ = options?.token != null ? String(options.token).trim() : ''
      const resUrl =
        tokenQ !== ''
          ? `/api/reservations/${restaurantId}?token=${encodeURIComponent(tokenQ)}`
          : `/api/reservations/${restaurantId}`
      const [resBookings, resStatus] = await Promise.all([
        fetch(resUrl).then((r) => r.json()),
        fetch(`/api/table-status/${restaurantId}`).then((r) => r.json()),
      ]);

      setAndPersist((prev) => {
        const otherRes = prev.reservations.filter(r => r.restaurantId !== restaurantId);
        const mappedBookings = Array.isArray(resBookings)
          ? resBookings.map((r) => ({
              id: typeof r._id === 'string' ? r._id : r._id.toString(),
              restaurantId: r.restaurantId,
              tableId: r.tableId,
              date: r.date,
              entryTime: r.startTime,
              exitTime: r.endTime,
              guestName: r.userName,
              userEmail: r.userEmail,
              guests: r.guests || 2,
              totalPrice: r.totalPrice,
              createdAt: r.createdAt,
              token: r.token,
              status: r.status,
              holdExpiresAt: r.holdExpiresAt,
            }))
          : []

        const nextManualReserved = { ...prev.manualReserved };
        Object.keys(nextManualReserved).forEach(k => {
          if (k.startsWith(`${restaurantId}::`)) delete nextManualReserved[k];
        });

        const nextRenamed = { ...prev.renamedTables };
        nextRenamed[restaurantId] = { ...(nextRenamed[restaurantId] || {}) };

        if (Array.isArray(resStatus)) {
          resStatus.forEach(s => {
            if (s.isManualReserved) {
              nextManualReserved[manualKey(restaurantId, s.tableId)] = true;
            }
            if (s.displayName) {
              nextRenamed[restaurantId][s.tableId] = s.displayName;
            }
          });
        }

        return { ...prev, reservations: [...otherRes, ...mappedBookings], manualReserved: nextManualReserved, renamedTables: nextRenamed };
      });
    } catch (err) {
      console.error(err);
    }
  }, [setAndPersist]);

  const value = useMemo(
    () => ({
      getTables,
      getTableUiStatus,
      isManualReserved,
      hasBookingConflict,
      createPaidReservation,
      setManualTableReserved,
      addTable,
      removeTable,
      renameTable,
      reservationsForRestaurant,
      syncRestaurant,
      allReservations: snapshot.reservations,
    }),
    [
      getTables,
      getTableUiStatus,
      isManualReserved,
      hasBookingConflict,
      createPaidReservation,
      setManualTableReserved,
      addTable,
      removeTable,
      renameTable,
      reservationsForRestaurant,
      syncRestaurant,
      snapshot.reservations,
    ],
  )

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>
}
