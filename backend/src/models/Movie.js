const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    genre: { type: String, required: true },
    poster: { type: String, required: true },
    rating: { type: Number, default: 8.0 },
    language: { type: String, default: 'English' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
