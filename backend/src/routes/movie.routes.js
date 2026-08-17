const express = require('express');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Seat = require('../models/Seat');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).lean();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

router.get('/:movieId/shows', async (req, res, next) => {
  try {
    const shows = await Show.find({
      movieId: req.params.movieId,
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 }).lean();

    res.json(shows);
  } catch (err) {
    next(err);
  }
});

router.get('/shows/:showId/seats', async (req, res, next) => {
  try {
    const now = new Date();

    await Seat.updateMany(
      {
        showId: req.params.showId,
        status: 'HELD',
        holdExpiresAt: { $lte: now }
      },
      {
        $set: { status: 'AVAILABLE', heldBy: null, holdExpiresAt: null }
      }
    );

    const seats = await Seat.find({ showId: req.params.showId })
      .sort({ seatNumber: 1 })
      .lean();

    res.json(seats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
