import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shows from './pages/Shows';
import Seats from './pages/Seats';
import Bookings from './pages/Bookings';
import PaymentResult from './pages/PaymentResult';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies/:movieId/shows" element={<Shows />} />
          <Route
            path="/shows/:showId/seats"
            element={
              <ProtectedRoute>
                <Seats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route path="/payment/success" element={<PaymentResult success />} />
          <Route path="/payment/cancel" element={<PaymentResult success={false} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
