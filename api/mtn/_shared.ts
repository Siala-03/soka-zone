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

function getPublicBaseUrl(req: any): string {
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

export function getMtnServerConfig(req: any) {
  const targetEnvironment = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';
  const publicBaseUrl = getPublicBaseUrl(req);

  return {
    baseUrl: trimTrailingSlash(process.env.MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com'),
    collectionApiUrl: trimTrailingSlash(
      process.env.MTN_COLLECTION_API_URL || 'https://sandbox.momodeveloper.mtn.com/collection'
    ),
    targetEnvironment,
    apiUserId: getRequiredEnv('MTN_API_USER_ID'),
    apiUserPassword: getRequiredEnv('MTN_API_USER_PASSWORD'),
    primaryKey: getRequiredEnv('MTN_PRIMARY_KEY'),
    callbackUrl: process.env.MTN_CALLBACK_URL || `${publicBaseUrl}/api/mtn/notify`,
  };
}

export async function getMtnAccessToken(req: any): Promise<string> {
  const config = getMtnServerConfig(req);
  const auth = Buffer.from(`${config.apiUserId}:${config.apiUserPassword}`).toString('base64');

  const response = await axios.post(
    `${config.collectionApiUrl}/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Ocp-Apim-Subscription-Key': config.primaryKey,
        'X-Target-Environment': config.targetEnvironment,
      },
    }
  );

  const token = response.data?.access_token;
  if (!token) {
    throw new Error('MTN token response did not include access_token');
  }

  return token;
}

export function normalizeMsisdn(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.startsWith('250') && digitsOnly.length === 12) {
    return digitsOnly;
  }

  if (digitsOnly.startsWith('07') && digitsOnly.length === 10) {
    return `25${digitsOnly}`;
  }

  if (digitsOnly.startsWith('7') && digitsOnly.length === 9) {
    return `250${digitsOnly}`;
  }

  return digitsOnly;
}

export function sendApiError(res: any, error: unknown, fallbackMessage: string, statusCode = 500) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(fallbackMessage, error);
  return res.status(statusCode).json({ error: message });
}
