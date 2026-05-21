import axios from 'axios';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_URL;
  return configuredBaseUrl ? trimTrailingSlash(configuredBaseUrl) : '';
}

function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

export type MtnPaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface InitiateMtnPaymentPayload {
  amount: number;
  currency: string;
  phone: string;
  payerMessage?: string;
  payeeNote?: string;
  externalId?: string;
}

export interface InitiateMtnPaymentResponse {
  message: string;
  referenceId: string;
  amount: string;
  currency: string;
  externalId: string;
  phone: string;
  statusCheckUrl: string;
}

export interface MtnStatusResponse {
  referenceId: string;
  status: MtnPaymentStatus;
  amount?: string;
  currency?: string;
  externalId?: string;
  financialTransactionId?: string;
  reason?: {
    code?: string;
    message?: string;
  };
}

export async function initiateMtnPayment(payload: InitiateMtnPaymentPayload): Promise<InitiateMtnPaymentResponse> {
  const response = await axios.post(buildApiUrl('/api/mtn/request'), payload);
  return response.data;
}

export async function fetchMtnPaymentStatus(referenceId: string): Promise<MtnStatusResponse> {
  const response = await axios.get(buildApiUrl('/api/mtn/status'), {
    params: { referenceId },
  });

  return response.data;
}
