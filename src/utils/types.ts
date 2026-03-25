// PesaPal Payment Types
export interface BookingWithPrice {
  id: string;
  date: string;
  time: string;
  duration: number;
  pitch: string;
  name: string;
  phone: string;
  email: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'payment_pending';
  amount: number;
  currency: string;
  paymentRef?: string;
  pesapalTrackingId?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface PaymentState {
  step: 'form' | 'processing' | 'success' | 'error';
  transactionId?: string;
  error?: string;
  amount?: number;
}

export interface PitchPricing {
  standard: number;
  premium: number;
  championship: number;
}
