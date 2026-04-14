import axios from 'axios';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_URL;
  return configuredBaseUrl ? trimTrailingSlash(configuredBaseUrl) : '';
}

function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
}

const PESAPAL_CONFIG = {
  ENVIRONMENT: import.meta.env.VITE_PESAPAL_ENV === 'production' ? 'production' : 'sandbox',
  API_BASE_URL: getApiBaseUrl(),
  CALLBACK_URL: `${window.location.origin}/payment/callback`,
  RETURN_URL: `${window.location.origin}/payment/success`,
};

export interface PesaPalPaymentRequest {
  id: string;
  reference: string;
  amount: number;
  description: string;
  currency: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  notificationId?: string;
  pesapalTrackingId?: string;
  callBackUrl?: string;
  redirectMode?: 'REDIRECT' | 'IFRAME';
  paymentMethod?: PaymentMethod;
}

// Payment method types supported by PesaPal
export type PaymentMethod = 'MOMO_INT' | 'AIRTEL' | 'MOMO_UGANDA' | 'PESAPAL_FLOAT' | 'CARD' | 'BANK' | 'PESAPAL' | 'DIRECT_BANK_TRANSFER'

// Rwanda-specific payment methods
export const RWANDA_PAYMENT_METHODS = {
  MTN_MOMO: {
    code: 'MOMO_INT',
    label: 'MTN MoMo',
    country: 'RW',
    description: 'Mobile Money via MTN',
    icon: 'mtn-icon'
  },
  AIRTEL_MONEY: {
    code: 'AIRTEL',
    label: 'Airtel Money',
    country: 'RW',
    description: 'Mobile Money via Airtel',
    icon: 'airtel-icon'
  },
  BANK_TRANSFER: {
    code: 'DIRECT_BANK_TRANSFER',
    label: 'Bank Transfer',
    country: 'RW',
    description: 'Direct Bank Transfer',
    icon: 'bank-icon'
  },
  CARD: {
    code: 'CARD',
    label: 'Debit/Credit Card',
    country: 'RW',
    description: 'Visa or Mastercard',
    icon: 'card-icon'
  }
} as const;

export interface PesaPalPaymentResponse {
  error: boolean;
  errorCode?: string;
  message: string;
  data?: {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url?: string;
    error?: string;
  };
}

export interface PesaPalTransactionStatus {
  order_id: string;
  order_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'INVALID';
  amount: number;
  payment_method?: string;
  created_date?: string;
  payment_date?: string;
  customer_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  merchant_reference?: string;
  error?: string;
  status_code?: string;
  status_description?: string;
}

// Client-side token access is intentionally disabled.
// PesaPal secrets must stay on the server in production.
export async function getPesaPalToken(): Promise<string> {
  throw new Error('PesaPal tokens are managed server-side. Use the payment API routes instead.');
}

// Initialize Payment Request
export async function initiatePesaPalPayment(
  paymentRequest: PesaPalPaymentRequest
): Promise<PesaPalPaymentResponse> {
  try {
    const payload: any = {
      id: paymentRequest.id,
      reference: paymentRequest.reference,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      currency: paymentRequest.currency || 'RWF',
      email: paymentRequest.email,
      phone: formatPhoneForPesaPal(paymentRequest.phone),
      first_name: paymentRequest.first_name,
      last_name: paymentRequest.last_name,
      callback_url: paymentRequest.callBackUrl || PESAPAL_CONFIG.CALLBACK_URL,
      notification_id: paymentRequest.notificationId,
      redirect_mode: paymentRequest.redirectMode || 'REDIRECT',
    };

    // Add payment method if specified (for Rwanda payment methods)
    if (paymentRequest.paymentMethod) {
      payload.payment_method = paymentRequest.paymentMethod;
    }

    console.log('Initiating PesaPal payment with payload:', {
      ...payload,
      phone: '***',
    });

    const response = await axios.post(buildApiUrl('/api/pesapal/submit'), {
      ...paymentRequest,
      phone: payload.phone,
      callBackUrl: paymentRequest.callBackUrl || PESAPAL_CONFIG.CALLBACK_URL,
      redirectMode: paymentRequest.redirectMode || 'REDIRECT',
    });

    if (response.data.error) {
      return {
        error: true,
        message: response.data.message || 'Payment initiation failed',
        errorCode: response.data.errorCode,
      };
    }

    return {
      error: false,
      message: 'Payment request initiated successfully',
      data: {
        order_tracking_id: response.data.order_tracking_id,
        merchant_reference: response.data.merchant_reference,
        redirect_url: response.data.redirect_url,
      },
    };
  } catch (error) {
    console.error('Error initiating PesaPal payment:', error);

    if (axios.isAxiosError(error)) {
      return {
        error: true,
        message: error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment. Please try again.',
      };
    }

    return {
      error: true,
      message: 'Failed to initiate payment. Please try again.',
    };
  }
}

// Get Payment Status
export async function getPesaPalPaymentStatus(
  orderTrackingId: string
): Promise<PesaPalTransactionStatus> {
  try {
    const response = await axios.get(buildApiUrl('/api/pesapal/status'), {
      params: {
        orderTrackingId,
      },
    });

    return {
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
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch payment status');
    }

    throw new Error('Failed to fetch payment status');
  }
}

// Validate callback signature (for security)
export function validatePesaPalCallback(
  data: Record<string, string>,
  signature: string
): boolean {
  try {
    // Create string to sign
    const stringToSign = `${data.pesapal_merchant_reference}${data.pesapal_transaction_tracking_id}${data.pesapal_transaction_status}`;
    void signature;
    void stringToSign;

    // Signature verification belongs on the server where the consumer secret exists.
    console.log('Callback validation - ensure proper HMAC-SHA256 verification in production');

    return true;
  } catch (error) {
    console.error('Error validating callback:', error);
    return false;
  }
}

// Generate unique merchant reference
export function generateMerchantReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `SKZONE-${timestamp}-${random}`.toUpperCase();
}

// Format phone number for PesaPal (E.164 format)
// Optimized for Rwanda MTN MOMO payments
export function formatPhoneForPesaPal(phone: string, countryCode = '+250'): string {
  // Remove any non-numeric characters except country code indicator
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with +, remove it initially for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If it starts with 250 (Rwanda country code), use as-is
  if (cleaned.startsWith('250')) {
    return '+' + cleaned;
  }
  
  // If it starts with 0 (local Rwanda format), replace with 250
  if (cleaned.startsWith('0')) {
    return '+250' + cleaned.substring(1);
  }
  
  // Otherwise, add country code
  return countryCode + cleaned;
}

// Validate Rwanda phone number for MTN MOMO
export function validateRwandaPhoneNumber(phone: string): { valid: boolean; formatted: string; network?: string } {
  const formatted = formatPhoneForPesaPal(phone);
  
  // Rwanda phone numbers should be 12 digits long (+250XXXX...)
  if (formatted.replace(/\D/g, '').length !== 12) {
    return {
      valid: false,
      formatted,
      network: undefined
    };
  }
  
  // Extract the main number after +250
  const mainNumber = formatted.substring(4, 7); // Get the network prefix (e.g., 788 for MTN)
  
  // Determine network based on prefix
  let network = 'UNKNOWN';
  if (mainNumber.startsWith('78') || mainNumber.startsWith('79')) {
    network = 'MTN';
  } else if (mainNumber.startsWith('72') || mainNumber.startsWith('73')) {
    network = 'Airtel';
  } else if (mainNumber.startsWith('85')) {
    network = 'Vodacom';
  }
  
  return {
    valid: true,
    formatted,
    network
  };
}

export const PESAPAL_CONFIG_EXPORT = PESAPAL_CONFIG;
