const STORAGE_KEY = 'tablewise-my-reservation-ids'

export function getStoredReservationIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.map((x) => String(x).trim()).filter(Boolean))]
  } catch {
    return []
  }
}

/** Newest-first list; de-duplicates by id. */
export function addStoredReservationId(reservationId) {
  const id = String(reservationId ?? '').trim()
  if (!id) return
  const rest = getStoredReservationIds().filter((x) => x !== id)
  const next = [id, ...rest]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

export function setStoredReservationIds(ids) {
  const next = [...new Set((ids ?? []).map((x) => String(x).trim()).filter(Boolean))]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
