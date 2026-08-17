const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

function startHoldCleanup() {
  const run = async () => {
    try {
      const now = new Date();

      const expiredBookings = await Booking.find({
        status: 'PENDING',
        expiresAt: { $lte: now }
      }).select('_id userId seats');

      for (const booking of expiredBookings) {
        await Booking.updateOne(
          { _id: booking._id, status: 'PENDING' },
          { $set: { status: 'EXPIRED', paymentStatus: 'FAILED' } }
        );

        await Seat.updateMany(
          {
            _id: { $in: booking.seats.map(s => s.seatId) },
            status: 'HELD',
            heldBy: booking.userId
          },
          {
            $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null }
          }
        );
      }

      await Seat.updateMany(
        {
          status: 'HELD',
          holdExpiresAt: { $lte: now }
        },
        {
          $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null }
        }
      );
    } catch (err) {
      console.error('Hold cleanup failed:', err.message);
    }
  };

  run();
  return setInterval(run, 15000);
}

module.exports = startHoldCleanup;
