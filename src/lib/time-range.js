/** @param {string} t e.g. "7:30 PM" */
export function timeToMinutes(t) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + min
}

export function isEndAfterStart(entryTime, exitTime) {
  const a = timeToMinutes(entryTime)
  const b = timeToMinutes(exitTime)
  if (a === null || b === null) return false
  return b > a
}

/** @returns {boolean} true if [aStart,aEnd) overlaps [bStart,bEnd) */
export function rangesOverlapMinutes(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

export function reservationOverlaps(entryA, exitA, entryB, exitB) {
  const as = timeToMinutes(entryA)
  const ae = timeToMinutes(exitA)
  const bs = timeToMinutes(entryB)
  const be = timeToMinutes(exitB)
  if (as === null || ae === null || bs === null || be === null) return false
  return rangesOverlapMinutes(as, ae, bs, be)
}
