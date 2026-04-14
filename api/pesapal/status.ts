import axios from 'axios';
import { getPesaPalServerConfig, getPesaPalToken, sendApiError } from './_shared';

function getQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const orderTrackingId = getQueryValue(req.query?.orderTrackingId) || getQueryValue(req.query?.reference);
  if (!orderTrackingId) {
    return res.status(400).json({ error: 'orderTrackingId query parameter is required' });
  }

  try {
    const token = await getPesaPalToken(req);
    const config = getPesaPalServerConfig(req);

    const response = await axios.get(`${config.apiUrl}/transaction/status`, {
      params: {
        reference: orderTrackingId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      order_id: response.data.order_id || orderTrackingId,
      order_status: response.data.status || 'PENDING',
      amount: response.data.amount,
      payment_method: response.data.payment_method,
      created_date: response.data.created_date,
      payment_date: response.data.payment_date,
      customer_email: response.data.customer_email,
      customer_first_name: response.data.customer_first_name,
      customer_last_name: response.data.customer_last_name,
      merchant_reference: response.data.merchant_reference,
      status_code: response.data.status_code,
      status_description: response.data.status_description,
    });
  } catch (error) {
    return sendApiError(res, error, 'Error fetching PesaPal payment status');
  }
}