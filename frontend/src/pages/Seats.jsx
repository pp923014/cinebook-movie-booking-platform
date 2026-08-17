import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Armchair, ArrowLeft, CreditCard } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function Seats() {
  const { showId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [show, setShow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get(`/movies/shows/${showId}/seats`);
    setSeats(data);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [showId]);

  useEffect(() => {
    // Show price is fetched from the user's selected show.
    // The API doesn't expose a direct show endpoint, so this reads the
    // amount later from the hold response. Seat screen remains self-contained.
  }, []);

  const price = useMemo(() => {
    const first = seats.find(Boolean);
    return first?.showPrice || 0;
  }, [seats]);

  function toggleSeat(seat) {
    if (seat.status === 'BOOKED') return;
    if (seat.status === 'HELD' && String(seat.heldBy) !== String(user?.id)) return;

    setSelected(current =>
      current.includes(seat._id)
        ? current.filter(id => id !== seat._id)
        : [...current, seat._id]
    );
  }

  async function checkout() {
    if (!user) {
      navigate('/login', { state: { from: `/shows/${showId}/seats` } });
      return;
    }

    if (!selected.length) return;

    setBusy(true);
    setError('');

    try {
      const hold = await api.post('/bookings/hold', {
        showId,
        seatIds: selected
      });

      const payment = await api.post('/payments/checkout', {
        bookingId: hold.data.bookingId
      });

      window.location.href = payment.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reserve these seats. Please try again.');
      setSelected([]);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const byNumber = new Map(seats.map(s => [s.seatNumber, s]));

  return (
    <div className="page narrow">
      <button className="back-link button-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="booking-heading">
        <div>
          <div className="eyebrow">SELECT YOUR SEATS</div>
          <h1>Choose your seats</h1>
          <p className="muted">Seats are held for 5 minutes while you complete payment.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="screen">SCREEN</div>

      <div className="seat-grid">
        {rows.map(row => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>
            {Array.from({ length: 8 }, (_, i) => {
              const seatNumber = `${row}${i + 1}`;
              const seat = byNumber.get(seatNumber);
              if (!seat) return <div className="seat empty" key={seatNumber} />;

              const isSelected = selected.includes(seat._id);
              const isMine = seat.status === 'HELD' && String(seat.heldBy) === String(user?.id);

              return (
                <button
                  key={seat._id}
                  className={`seat ${seat.status.toLowerCase()} ${isSelected || isMine ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seat)}
                  title={`${seatNumber} — ${seat.status}`}
                >
                  <Armchair size={16} />
                  <span>{seatNumber}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <span><i className="dot available" /> Available</span>
        <span><i className="dot selected-dot" /> Selected</span>
        <span><i className="dot booked" /> Booked</span>
      </div>

      <div className="booking-bar">
        <div>
          <strong>{selected.length} seat{selected.length !== 1 ? 's' : ''}</strong>
          <span className="muted"> · Selected for checkout</span>
        </div>
        <button
          className="primary-btn"
          disabled={!selected.length || busy}
          onClick={checkout}
        >
          <CreditCard size={17} />
          {busy ? 'Reserving...' : 'Continue to payment'}
        </button>
      </div>
    </div>
  );
}
