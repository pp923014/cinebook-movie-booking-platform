import { Link, useNavigate } from 'react-router-dom';
import { Film, Ticket, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark"><Film size={19} /></span>
          CineBook
        </Link>

        <nav className="nav-links">
          <Link to="/"><Film size={16} /> Movies</Link>
          {user && <Link to="/bookings"><Ticket size={16} /> My Bookings</Link>}
          {user ? (
            <button
              className="nav-user"
              onClick={() => { logout(); navigate('/'); }}
            >
              <UserRound size={16} /> {user.name}
              <LogOut size={15} />
            </button>
          ) : (
            <Link className="nav-cta" to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">CineBook · Built for reliable seat booking</footer>
    </div>
  );
}
