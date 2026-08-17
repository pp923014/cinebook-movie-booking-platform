const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');

const router = express.Router();

const HOLD_MINUTES = 5;

router.post('/hold', auth, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { showId, seatIds } = req.body;

    if (!mongoose.isValidObjectId(showId) || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'showId and at least one seatId are required' });
    }

    if (seatIds.length > 8) {
      return res.status(400).json({ message: 'You can select up to 8 seats' });
    }

    const uniqueSeatIds = [...new Set(seatIds.map(String))];

    const show = await Show.findById(showId).session(session);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    let lockedSeats = [];

    await session.withTransaction(async () => {
      const now = new Date();

      // Release stale holds for this show before attempting the new reservation.
      await Seat.updateMany(
        {
          showId,
          status: 'HELD',
          holdExpiresAt: { $lte: now }
        },
        {
          $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null }
        },
        { session }
      );

      for (const seatId of uniqueSeatIds) {
        const seat = await Seat.findOneAndUpdate(
          {
            _id: seatId,
            showId,
            $or: [
              { status: 'AVAILABLE' },
              { status: 'HELD', heldBy: req.user._id, holdExpiresAt: { $lte: now } }
            ]
          },
          {
            $set: {
              status: 'HELD',
              heldBy: req.user._id,
              holdExpiresAt: expiresAt
            }
          },
          { new: true, session }
        );

        if (!seat) {
          const error = new Error('One or more selected seats are no longer available');
          error.status = 409;
          throw error;
        }

        lockedSeats.push(seat);
      }
    });

    const amount = lockedSeats.length * show.price;

    const booking = await Booking.create({
      userId: req.user._id,
      showId,
      seats: lockedSeats.map(s => ({
        seatId: s._id,
        seatNumber: s.seatNumber
      })),
      amount,
      expiresAt
    });

    res.status(201).json({
      bookingId: booking._id,
      amount,
      expiresAt,
      seats: booking.seats
    });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
});

router.get('/mine', auth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showId',
        populate: { path: 'movieId', select: 'title poster' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
