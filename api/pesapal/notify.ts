import crypto from 'crypto';

// PesaPal webhook path: POST /api/pesapal/notify
// Ensure Vercel project variable PESAPAL_CONSUMER_SECRET is set (from your slide). Sample:
// PESAPAL_CONSUMER_SECRET=+/3f2gVsSl1TuVwa9Mxi2dZnpmo=

function verifySignature(body: any, secret: string): boolean {
  if (!body || !body.pesapal_merchant_reference || !body.pesapal_transaction_tracking_id || !body.pesapal_transaction_status || !body.pesapal_signature) {
    return false;
  }

  const payload = `${body.pesapal_merchant_reference}${body.pesapal_transaction_tracking_id}${body.pesapal_transaction_status}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('base64');

  return expected === body.pesapal_signature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).send('PesaPal notify endpoint is running');
  }

  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).send('Method Not Allowed');
  }

  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!secret) {
    console.error('PESAPAL_CONSUMER_SECRET is missing in environment');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Empty request body' });
  }

  const signed = verifySignature(payload, secret);
  if (!signed) {
    console.warn('PesaPal signature mismatch', payload);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const status = payload.pesapal_transaction_status;
  const merchantRef = payload.pesapal_merchant_reference;
  const trackingId = payload.pesapal_transaction_tracking_id;

  // You can add logic here to update your database booking state by merchantRef/trackingId.
  // For production, connect to Firestore/Firebase Admin or your own DB and mark completed/failed.

  console.info('PesaPal notification received', { merchantRef, trackingId, status });

  return res.status(200).json({ message: 'Notification received', status });
}