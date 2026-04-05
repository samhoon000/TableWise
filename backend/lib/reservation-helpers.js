const Reservation = require("../models/Reservation")

const TOKEN_LENGTH = 6

async function generateUniqueReservationToken() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const max = 10 ** TOKEN_LENGTH - 1
    const min = 10 ** (TOKEN_LENGTH - 1)
    const token = String(Math.floor(min + Math.random() * (max - min + 1)))
    const clash = await Reservation.findOne({ token })
    if (!clash) return token
  }
  throw new Error("Could not allocate a unique verification token")
}

async function findBlockingReservation(tableId, date, startTime, endTime, excludeId) {
  const candidates = await Reservation.find({
    tableId,
    date,
    status: { $in: ["confirmed", "booked"] },
  })

  for (const r of candidates) {
    if (excludeId && r._id.toString() === excludeId.toString()) continue
    if (r.startTime < endTime && r.endTime > startTime) return r
  }
  return null
}

module.exports = {
  generateUniqueReservationToken,
  findBlockingReservation,
  TOKEN_LENGTH,
}
