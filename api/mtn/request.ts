import axios from 'axios';
import { getMtnAccessToken, getMtnServerConfig, normalizeMsisdn, sendApiError } from './_shared';

declare const process: { env: Record<string, string | undefined> };

function toMoney(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value.toFixed(2);
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed.toFixed(2);
    }
  }

  return '100.00';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const paymentRequest = req.body || {};
  const rawPhone = String(paymentRequest.phone || process.env.MTN_SANDBOX_MSISDN || '250788123456');
  const phone = normalizeMsisdn(rawPhone);

  if (!/^2507\d{8}$/.test(phone)) {
    return res.status(400).json({ error: 'phone must be a valid Rwanda MTN/Airtel MSISDN (2507XXXXXXXX)' });
  }

  const amount = toMoney(paymentRequest.amount);

  try {
    const token = await getMtnAccessToken(req);
    const config = getMtnServerConfig(req);
    const referenceId = crypto.randomUUID();

    const payload = {
      amount,
      currency: String(paymentRequest.currency || process.env.MTN_CURRENCY || 'EUR'),
      externalId: String(paymentRequest.externalId || `SKZ-${Date.now()}`),
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone,
      },
      payerMessage: String(paymentRequest.payerMessage || 'Soka Zone booking payment'),
      payeeNote: String(paymentRequest.payeeNote || 'Booking payment'),
    };

    await axios.post(`${config.collectionApiUrl}/v1_0/requesttopay`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': config.targetEnvironment,
        'Ocp-Apim-Subscription-Key': config.primaryKey,
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      message: 'Request to pay created',
      referenceId,
      amount,
      currency: payload.currency,
      externalId: payload.externalId,
      phone,
      statusCheckUrl: `/api/mtn/status?referenceId=${referenceId}`,
    });
  } catch (error) {
    return sendApiError(res, error, 'Error initiating MTN payment');
  }
}
