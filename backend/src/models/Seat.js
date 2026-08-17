const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    seatNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'HELD', 'BOOKED'],
      default: 'AVAILABLE',
      index: true
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    holdExpiresAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
);

seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
