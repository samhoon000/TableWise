const Reservation = require("../models/Reservation");
const { findBlockingReservation } = require("../lib/reservation-helpers");

// ✅ Create booking (legacy direct API — no payment token)
exports.bookTable = async (req, res) => {
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
    } = req.body;

    const blocking = await findBlockingReservation(tableId, date, startTime, endTime);
    if (blocking) {
      return res.status(400).json({ message: "Table already booked" });
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
    });

    await reservation.save();

    res.status(201).json({
      message: "Booking successful",
      reservation,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all bookings for a restaurant (admin)
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      restaurantId: req.params.restaurantId,
    });

    res.json(reservations);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};