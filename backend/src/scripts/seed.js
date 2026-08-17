require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Seat = require('../models/Seat');

const seatNumbers = [];
for (const row of ['A', 'B', 'C', 'D', 'E', 'F']) {
  for (let i = 1; i <= 8; i++) {
    seatNumbers.push(`${row}${i}`);
  }
}

async function seed() {
  await connectDB();

  await Movie.deleteMany({});
  await Show.deleteMany({});
  await Seat.deleteMany({});

  const movies = await Movie.insertMany([
    {
      title: 'Interstellar',
      description: 'A team travels beyond our galaxy in search of a future for humanity.',
      duration: 169,
      genre: 'Sci-Fi',
      language: 'English',
      rating: 8.7,
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    },
    {
      title: 'Inception',
      description: 'A skilled extractor enters dreams to plant an idea inside a target.',
      duration: 148,
      genre: 'Sci-Fi',
      language: 'English',
      rating: 8.8,
      poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'
    },
    {
      title: 'The Dark Knight',
      description: 'Batman faces a criminal mastermind who pushes Gotham into chaos.',
      duration: 152,
      genre: 'Action',
      language: 'English',
      rating: 9.0,
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
      duration: 166,
      genre: 'Adventure',
      language: 'English',
      rating: 8.7,
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'
    }
  ]);

  const now = new Date();
  const shows = [];

  for (let movieIndex = 0; movieIndex < movies.length; movieIndex++) {
    for (let i = 1; i <= 3; i++) {
      const start = new Date(now.getTime() + (movieIndex * 2 + i) * 2 * 60 * 60 * 1000);

      shows.push({
        movieId: movies[movieIndex]._id,
        startTime: start,
        price: 250 + movieIndex * 50,
        screen: `Screen ${i}`
      });
    }
  }

  const createdShows = await Show.insertMany(shows);

  const seats = [];
  for (const show of createdShows) {
    for (const seatNumber of seatNumbers) {
      seats.push({
        showId: show._id,
        seatNumber
      });
    }
  }

  await Seat.insertMany(seats);

  console.log(`Seeded ${movies.length} movies, ${createdShows.length} shows and ${seats.length} seats.`);
  await mongoose.connection.close();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
