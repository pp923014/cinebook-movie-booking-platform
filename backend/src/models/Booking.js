const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seats: [
      {
        seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
        seatNumber: { type: String, required: true }
      }
    ],
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    stripeSessionId: { type: String, unique: true, sparse: true },
    paymentIntentId: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
