import axios from 'axios';
import { getPesaPalServerConfig, getPesaPalToken, sendApiError } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const paymentRequest = req.body;
  if (!paymentRequest) {
    return res.status(400).json({ error: 'Missing payment request body' });
  }

  try {
    const token = await getPesaPalToken(req);
    const config = getPesaPalServerConfig(req);

    const payload: Record<string, unknown> = {
      id: paymentRequest.id,
      reference: paymentRequest.reference,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      currency: paymentRequest.currency || 'RWF',
      email: paymentRequest.email,
      phone_number: paymentRequest.phone,
      first_name: paymentRequest.first_name,
      last_name: paymentRequest.last_name,
      callback_url: paymentRequest.callBackUrl || config.callbackUrl,
      redirect_mode: paymentRequest.redirectMode || 'REDIRECT',
    };

    const notificationId = paymentRequest.notificationId || config.notificationId;
    if (notificationId) {
      payload.notification_id = notificationId;
    }

    if (paymentRequest.paymentMethod) {
      payload.payment_method = paymentRequest.paymentMethod;
    }

    const response = await axios.post(`${config.apiUrl}/submit`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.error || response.data?.status_code !== '0') {
      return res.status(400).json({
        error: true,
        message: response.data?.error || response.data?.status_description || 'Payment initiation failed',
        errorCode: response.data?.status_code,
      });
    }

    return res.status(200).json({
      error: false,
      message: 'Payment request initiated successfully',
      data: {
        order_tracking_id: response.data.order_tracking_id,
        merchant_reference: response.data.merchant_reference,
        redirect_url: response.data.redirect_url,
      },
    });
  } catch (error) {
    return sendApiError(res, error, 'Error initiating PesaPal payment');
  }
}