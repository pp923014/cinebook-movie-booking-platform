# CineBook — MERN Movie Booking Platform

A focused movie-booking project built to demonstrate one important backend problem:
**preventing concurrent users from booking the same seat**.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Stripe Checkout + Webhooks
- MongoDB transactions + atomic conditional seat updates
- Tailwind-style custom CSS (no UI framework dependency)

## Main flow

1. User registers/logs in.
2. User selects a movie and show.
3. User selects seats.
4. Backend atomically holds every selected seat inside a MongoDB transaction.
5. Backend creates a Stripe Checkout Session.
6. Stripe webhook confirms payment.
7. Booking becomes confirmed.
8. Expired holds are released by a periodic worker.

## Important concurrency decision

For a seat, the backend only updates:

`status: AVAILABLE -> HELD`

when the document still matches `status: AVAILABLE`.

MongoDB's single-document update is atomic. For multiple seats, a MongoDB transaction provides all-or-nothing behavior.

This project intentionally does not use Redis/Redlock in V1. Redis locking can be discussed as a V2/scaling option.

## Run

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Seed sample movies/shows/seats

```bash
cd backend
npm run seed
```

## Stripe local webhook

Install Stripe CLI and run:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Environment

Backend `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cinebook
JWT_SECRET=change-me
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Interview talking points

- Race conditions in seat booking
- Atomic conditional updates
- MongoDB transactions
- Idempotent Stripe webhooks
- Payment state machine
- Temporary seat holds
- Failure handling
- Why MongoDB was chosen for V1
- How Redis/Redlock could be introduced later
