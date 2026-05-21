import axios from 'axios';
import { getMtnAccessToken, getMtnServerConfig, sendApiError } from './_shared';

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

  const referenceId = getQueryValue(req.query?.referenceId);
  if (!referenceId) {
    return res.status(400).json({ error: 'referenceId query parameter is required' });
  }

  try {
    const token = await getMtnAccessToken(req);
    const config = getMtnServerConfig(req);

    const response = await axios.get(`${config.collectionApiUrl}/v1_0/requesttopay/${referenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': config.targetEnvironment,
        'Ocp-Apim-Subscription-Key': config.primaryKey,
      },
    });

    return res.status(200).json({
      referenceId,
      status: response.data?.status || 'PENDING',
      amount: response.data?.amount,
      currency: response.data?.currency,
      externalId: response.data?.externalId,
      payer: response.data?.payer,
      payerMessage: response.data?.payerMessage,
      payeeNote: response.data?.payeeNote,
      financialTransactionId: response.data?.financialTransactionId,
      reason: response.data?.reason,
    });
  } catch (error) {
    return sendApiError(res, error, 'Error fetching MTN payment status');
  }
}
