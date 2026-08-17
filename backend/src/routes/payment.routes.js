const express = require('express');
const Stripe = require('stripe');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/checkout', auth, async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      expiresAt: { $gt: new Date() }
    }).populate('showId');

    if (!booking) {
      return res.status(400).json({ message: 'Booking is invalid or has expired' });
    }

    if (booking.stripeSessionId) {
      const existing = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      return res.json({ url: existing.url });
    }

    const movie = await Show.findById(booking.showId._id).populate('movieId');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${movie.movieId.title} — Movie Tickets`,
              description: `${booking.seats.map(s => s.seatNumber).join(', ')}`
            },
            unit_amount: Math.round(booking.amount * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        bookingId: booking._id.toString()
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?bookingId=${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?bookingId=${booking._id}`
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Stripe requires the raw request body for signature verification.
// This route is mounted before express.json() in server.js.
router.post('/webhook', async (req, res) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId);

        // Idempotency: Stripe can deliver the same webhook more than once.
        if (booking && booking.paymentStatus !== 'PAID') {
          booking.paymentStatus = 'PAID';
          booking.status = 'CONFIRMED';
          booking.paymentIntentId = session.payment_intent || null;
          await booking.save();

          await Seat.updateMany(
            {
              _id: { $in: booking.seats.map(s => s.seatId) },
              heldBy: booking.userId,
              status: 'HELD'
            },
            {
              $set: { status: 'BOOKED', heldBy: null, holdExpiresAt: null }
            }
          );
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId);

        if (booking && booking.paymentStatus === 'PENDING') {
          booking.status = 'EXPIRED';
          booking.paymentStatus = 'FAILED';
          await booking.save();

          await Seat.updateMany(
            {
              _id: { $in: booking.seats.map(s => s.seatId) },
              heldBy: booking.userId,
              status: 'HELD'
            },
            {
              $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null }
            }
          );
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing failed:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;
