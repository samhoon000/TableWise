const express = require('express')
const Razorpay = require('razorpay')
const cors = require('cors')
const mongoose = require("mongoose")
const { isValidObjectId } = mongoose
require("dotenv").config()

const Reservation = require("./models/Reservation")
const TableStatus = require("./models/TableStatus")
const {
  generateUniqueReservationToken,
  findBlockingReservation,
} = require("./lib/reservation-helpers")

const app = express()
app.use(cors())
app.use(express.json())

// 🔗 Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("Connected to DB:", mongoose.connection.name);
  })
  .catch(err => console.log(err));

// Razorpay setup
const razorpay = new Razorpay({
  key_id: "rzp_test_YOUR_KEY_ID",
  key_secret: "YOUR_SECRET",
})

// 💳 PAYMENT ROUTE
app.post('/create-order', async (req, res) => {
  const { amount } = req.body

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    })

    res.json(order)
  } catch (err) {
    console.log(err)
    res.status(500).send("Error creating order")
  }
})

// 🍽️ BOOK TABLE (legacy / direct API — no payment token)
app.post("/api/reservations/book-table", async (req, res) => {
  try {
    const {
      restaurantId,
      tableId,
      userName,
      userEmail,
      date,
      startTime,
      endTime,
      guests,
      totalPrice,
    } = req.body

    const blocking = await findBlockingReservation(tableId, date, startTime, endTime)
    if (blocking) {
      return res.status(400).json({ message: "Table already booked" })
    }

    const reservation = new Reservation({
      restaurantId,
      tableId,
      userName,
      userEmail,
      date,
      startTime,
      endTime,
      guests,
      totalPrice,
      status: "booked",
    })

    await reservation.save()

    console.log("Saved to DB:", reservation)

    res.status(201).json({ message: "Booking successful", reservation })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ AFTER SUCCESSFUL PAYMENT — create confirmed reservation + verification token (no pre-hold)
app.post("/api/reservations/book-after-payment", async (req, res) => {
  try {
    const {
      restaurantId,
      tableId,
      userName,
      userEmail,
      date,
      startTime,
      endTime,
      guests,
      totalPrice,
    } = req.body

    if (!restaurantId || !tableId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields" })
    }

    const blocking = await findBlockingReservation(tableId, date, startTime, endTime)
    if (blocking) {
      return res.status(400).json({ message: "Table already booked" })
    }

    const token = await generateUniqueReservationToken()
    const reservation = new Reservation({
      restaurantId,
      tableId,
      userName: userName || "Guest",
      userEmail: userEmail || "guest@example.com",
      date,
      startTime,
      endTime,
      guests,
      totalPrice,
      status: "confirmed",
      token,
    })

    await reservation.save()
    res.status(201).json({ message: "Booking confirmed", reservation })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message || "Server error" })
  }
})

// 📊 Guests booked today per restaurant (aggregate)
app.get("/api/reservations/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]

    const data = await Reservation.aggregate([
      {
        $match: {
          date: today,
          status: { $in: ["booked", "confirmed"] },
        },
      },
      {
        $group: {
          _id: "$restaurantId",
          totalGuests: { $sum: "$guests" },
        },
      },
    ])

    const result = {}
    data.forEach((item) => {
      result[item._id] = item.totalGuests
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 📋 BATCH BY IDS (My Reservations — no auth)
app.post("/api/reservations/by-ids", async (req, res) => {
  try {
    const raw = req.body?.ids
    const ids = Array.isArray(raw) ? raw : []
    const seen = new Set()
    const valid = []
    const invalidIds = []
    for (const x of ids) {
      const s = String(x ?? "").trim()
      if (!s || seen.has(s)) continue
      seen.add(s)
      if (isValidObjectId(s)) valid.push(s)
      else invalidIds.push(s)
    }

    if (valid.length === 0) {
      return res.json({ reservations: [], missingIds: [], invalidIds })
    }

    const found = await Reservation.find({ _id: { $in: valid } }).lean()
    const foundSet = new Set(found.map((d) => String(d._id)))
    const missingIds = valid.filter((id) => !foundSet.has(id))

    found.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    res.json({ reservations: found, missingIds, invalidIds })
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" })
  }
})

// 📄 SINGLE BOOKING (confirmation page / refresh-safe) — full document as JSON
app.get("/api/reservations/booking/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid reservation id" })
    }
    const reservation = await Reservation.findById(req.params.id).lean()
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" })
  }
})

// 🧑‍💼 GET BOOKINGS (optional ?token= for admin verification search)
app.get("/api/reservations/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params
    const tokenRaw = req.query.token
    const filter = { restaurantId }
    if (tokenRaw != null && String(tokenRaw).trim() !== "") {
      filter.token = String(tokenRaw).trim()
    }
    const reservations = await Reservation.find(filter).sort({ date: 1, startTime: 1 })
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🗑️ DELETE BOOKING
app.delete("/api/reservations/:id", async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🔧 GET TABLE STATUS
app.get("/api/table-status/:restaurantId", async (req, res) => {
  try {
    const statuses = await TableStatus.find({
      restaurantId: req.params.restaurantId,
    })
    res.json(statuses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🔧 SET TABLE STATUS
app.post("/api/table-status", async (req, res) => {
  try {
    const { restaurantId, tableId, isManualReserved, displayName } = req.body
    
    const updatePayload = {}
    if (isManualReserved !== undefined) updatePayload.isManualReserved = isManualReserved
    if (displayName !== undefined) updatePayload.displayName = displayName

    await TableStatus.findOneAndUpdate(
      { restaurantId, tableId },
      { $set: updatePayload },
      { upsert: true, new: true }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🚀 Start server
app.listen(5000, () => console.log("Server running on port 5000"))