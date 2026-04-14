import axios from 'axios';

type HeaderValue = string | string[] | undefined;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function getHeader(req: any, name: string): string | undefined {
  const headerValue = req?.headers?.[name] as HeaderValue;

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function getPublicBaseUrl(req: any): string {
  const configuredUrl = process.env.PUBLIC_SITE_URL;
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const forwardedProto = getHeader(req, 'x-forwarded-proto') || 'http';
  const forwardedHost = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host');

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return 'http://localhost:5173';
}

export function getPesaPalServerConfig(req: any) {
  const environment = process.env.PESAPAL_ENV === 'production' ? 'production' : 'sandbox';
  const publicBaseUrl = getPublicBaseUrl(req);

  return {
    environment,
    apiUrl:
      environment === 'production'
        ? 'https://api.pesapal.com/api/merchants'
        : 'https://sandbox.pesapal.com/api/merchants',
    consumerKey: getRequiredEnv('PESAPAL_CONSUMER_KEY'),
    consumerSecret: getRequiredEnv('PESAPAL_CONSUMER_SECRET'),
    callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${publicBaseUrl}/payment/callback`,
    notificationUrl: process.env.PESAPAL_NOTIFICATION_URL || `${publicBaseUrl}/api/pesapal/notify`,
    notificationId: process.env.PESAPAL_NOTIFICATION_ID,
  };
}

export async function getPesaPalToken(req: any): Promise<string> {
  const config = getPesaPalServerConfig(req);
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

  const response = await axios.get(`${config.apiUrl}/token`, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.data?.token) {
    throw new Error('PesaPal token response did not include a token');
  }

  return response.data.token;
}

export function sendApiError(res: any, error: unknown, fallbackMessage: string, statusCode = 500) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(fallbackMessage, error);
  return res.status(statusCode).json({ error: message });
}