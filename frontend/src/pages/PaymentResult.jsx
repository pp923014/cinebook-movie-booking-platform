import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentResult({ success }) {
  const [params] = useSearchParams();

  return (
    <div className="result-page">
      <div className={`result-icon ${success ? 'success-icon' : 'failed-icon'}`}>
        {success ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
      </div>
      <div className="eyebrow">{success ? 'PAYMENT SUBMITTED' : 'PAYMENT CANCELLED'}</div>
      <h1>{success ? 'You’re all set.' : 'Payment was cancelled.'}</h1>
      <p>
        {success
          ? 'Your payment has been sent to Stripe. The booking will be confirmed after the webhook is processed.'
          : 'Your seat hold may expire automatically if you do not complete payment.'}
      </p>
      {params.get('bookingId') && (
        <p className="small-muted">Booking: {params.get('bookingId')}</p>
      )}
      <Link className="primary-btn" to={success ? '/bookings' : '/'}>Continue</Link>
    </div>
  );
}
