require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const startHoldCleanup = require('./services/holdCleanup');
const { notFound, errorHandler } = require('./middleware/error');

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(morgan('dev'));

  // Stripe webhook must receive the raw body.
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'cinebook-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`CineBook API running on http://localhost:${port}`);
  });

  startHoldCleanup();
}

bootstrap().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
