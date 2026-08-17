import { useEffect, useState } from 'react';
import { Ticket, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import api from '../api';

function Status({ status }) {
  if (status === 'CONFIRMED') return <span className="status success"><CheckCircle2 size={14} /> Confirmed</span>;
  if (status === 'PENDING') return <span className="status pending"><Clock3 size={14} /> Payment pending</span>;
  return <span className="status failed"><XCircle size={14} /> {status}</span>;
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings/mine').then(res => setBookings(res.data));
  }, []);

  return (
    <div className="page narrow">
      <div className="eyebrow">YOUR TICKETS</div>
      <h1>My bookings</h1>
      <p className="muted">A history of your CineBook reservations.</p>

      <div className="booking-list">
        {!bookings.length && <div className="empty-state"><Ticket size={28} /> No bookings yet.</div>}

        {bookings.map(booking => (
          <article className="booking-card" key={booking._id}>
            <div className="booking-poster">
              <img src={booking.showId?.movieId?.poster} alt="" />
            </div>
            <div className="booking-content">
              <div className="booking-card-head">
                <div>
                  <div className="eyebrow">BOOKING #{booking._id.slice(-6).toUpperCase()}</div>
                  <h3>{booking.showId?.movieId?.title || 'Movie'}</h3>
                </div>
                <Status status={booking.status} />
              </div>

              <div className="booking-details">
                <span>{booking.seats.map(s => s.seatNumber).join(', ')}</span>
                <span>₹{booking.amount}</span>
                <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
