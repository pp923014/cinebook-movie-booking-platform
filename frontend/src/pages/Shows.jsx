import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import api from '../api';

export default function Shows() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/movies'),
      api.get(`/movies/${movieId}/shows`)
    ]).then(([moviesRes, showsRes]) => {
      setMovie(moviesRes.data.find(m => m._id === movieId));
      setShows(showsRes.data);
    });
  }, [movieId]);

  return (
    <div className="page narrow">
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to movies</Link>

      {movie && (
        <div className="show-header">
          <img src={movie.poster} alt={movie.title} />
          <div>
            <div className="eyebrow">{movie.genre} · {movie.language}</div>
            <h1>{movie.title}</h1>
            <p>{movie.description}</p>
            <span className="muted"><Clock3 size={14} /> {movie.duration} minutes</span>
          </div>
        </div>
      )}

      <div className="section-head show-list-head">
        <div>
          <div className="eyebrow">SHOWTIMES</div>
          <h2>Choose a show</h2>
        </div>
      </div>

      <div className="show-list">
        {shows.map(show => (
          <Link key={show._id} className="show-card" to={`/shows/${show._id}/seats`}>
            <div>
              <div className="show-time">
                {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="muted">
                <CalendarDays size={14} />
                {new Date(show.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="show-right">
              <span>{show.screen}</span>
              <strong>₹{show.price}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
