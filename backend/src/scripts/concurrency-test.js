/*
  Usage:
    node src/scripts/concurrency-test.js <showId> <seatId> <token1> <token2>

  This script fires two hold requests at the same time.
  Expected behavior: only one request can successfully hold the same seat.
*/
const baseUrl = process.env.API_URL || 'http://localhost:5000/api';

async function run() {
  const [, , showId, seatId, token1, token2] = process.argv;

  if (!showId || !seatId || !token1 || !token2) {
    console.log('Usage: node src/scripts/concurrency-test.js <showId> <seatId> <token1> <token2>');
    process.exit(1);
  }

  const request = (token) =>
    fetch(`${baseUrl}/bookings/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ showId, seatIds: [seatId] })
    }).then(async res => ({
      status: res.status,
      body: await res.json()
    }));

  const results = await Promise.all([request(token1), request(token2)]);

  console.table(results.map(r => ({ status: r.status, message: r.body.message })));
  console.log('Expected: exactly one 201 and one 409.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
