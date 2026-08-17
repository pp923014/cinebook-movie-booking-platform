const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    screen: { type: String, default: 'Screen 1' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);
