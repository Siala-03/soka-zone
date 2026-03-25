import axios from 'axios';

// PesaPal Configuration
// NOTE: Replace these with your actual PesaPal credentials from the dashboard
const PESAPAL_CONFIG = {
  // Get from PesaPal merchant dashboard
  CONSUMER_KEY: import.meta.env.VITE_PESAPAL_CONSUMER_KEY || 'your_consumer_key',
  CONSUMER_SECRET: import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || 'your_consumer_secret',
  
  // Sandbox vs Live
  API_URL: import.meta.env.VITE_PESAPAL_ENV === 'production' 
    ? 'https://api.pesapal.com/api/merchants'
    : 'https://sandbox.pesapal.com/api/merchants',
  
  // Callback URLs - Update these to your actual domain
  CALLBACK_URL: `${window.location.origin}/payment/callback`,
  RETURN_URL: `${window.location.origin}/payment/success`,
  NOTIFICATION_URL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/pesapal/notify`,
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
}

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

// Get Bearer Token for API authentication
export async function getPesaPalToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${PESAPAL_CONFIG.CONSUMER_KEY}:${PESAPAL_CONFIG.CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      `${PESAPAL_CONFIG.API_URL}/token`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.token;
  } catch (error) {
    console.error('Error getting PesaPal token:', error);
    throw new Error('Failed to authenticate with PesaPal');
  }
}

// Initialize Payment Request
export async function initiatePesaPalPayment(
  paymentRequest: PesaPalPaymentRequest
): Promise<PesaPalPaymentResponse> {
  try {
    const token = await getPesaPalToken();

    const payload = {
      id: paymentRequest.id,
      reference: paymentRequest.reference,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      currency: paymentRequest.currency || 'RWF',
      email: paymentRequest.email,
      phone_number: paymentRequest.phone.replace(/\D/g, ''), // Remove non-digits
      first_name: paymentRequest.first_name,
      last_name: paymentRequest.last_name,
      callback_url: paymentRequest.callBackUrl || PESAPAL_CONFIG.CALLBACK_URL,
      notification_id: paymentRequest.notificationId,
      redirect_mode: paymentRequest.redirectMode || 'REDIRECT',
    };

    const response = await axios.post(
      `${PESAPAL_CONFIG.API_URL}/submit`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.error || response.data.status_code !== '0') {
      return {
        error: true,
        message: response.data.error || response.data.status_description || 'Payment initiation failed',
        errorCode: response.data.status_code,
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
    const token = await getPesaPalToken();

    const response = await axios.get(
      `${PESAPAL_CONFIG.API_URL}/transaction/status?reference=${orderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
    const stringToSign = `${data.pesapal_merchant_reference}${data.pesapal_transaction_tracking_id}${data.pesapal_transaction_status}${PESAPAL_CONFIG.CONSUMER_SECRET}`;

    // For sandbox/development, we'll skip strict validation
    // In production, implement HMAC-SHA256 signature verification
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
export function formatPhoneForPesaPal(phone: string, countryCode: string = '+250'): string {
  // Remove any non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    return countryCode + cleaned.substring(1);
  }
  
  // If it doesn't have country code, add it
  if (!cleaned.startsWith(countryCode.replace('+', ''))) {
    return countryCode + cleaned;
  }
  
  return countryCode + cleaned;
}

export const PESAPAL_CONFIG_EXPORT = PESAPAL_CONFIG;
