import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Star } from 'lucide-react';
import api from '../api';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/movies')
      .then(res => setMovies(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="eyebrow">MOVIE NIGHT, SIMPLIFIED</div>
          <h1>Pick a seat.<br /><span>Make it yours.</span></h1>
          <p>
            A focused movie booking experience with reliable seat reservations
            and secure checkout.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">NOW SHOWING</div>
            <h2>Choose your movie</h2>
          </div>
          <span className="muted">{movies.length} movies</span>
        </div>

        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : (
          <div className="movie-grid">
            {movies.map(movie => (
              <article className="movie-card" key={movie._id}>
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-info">
                  <div className="movie-topline">
                    <span className="pill">{movie.genre}</span>
                    <span className="rating"><Star size={14} fill="currentColor" /> {movie.rating}</span>
                  </div>
                  <h3>{movie.title}</h3>
                  <p>{movie.description}</p>
                  <div className="movie-meta">
                    <span><Clock3 size={14} /> {movie.duration} min</span>
                    <span>{movie.language}</span>
                  </div>
                  <Link className="primary-btn full" to={`/movies/${movie._id}/shows`}>
                    View shows
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
