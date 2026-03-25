import React, { useState } from 'react';
import { CreditCard, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { initiatePesaPalPayment, generateMerchantReference, formatPhoneForPesaPal } from '../utils/pesapal';

interface PesaPalPaymentProps {
  bookingData: {
    date: string;
    time: string;
    duration: number;
    pitch: string;
    name: string;
    phone: string;
    email: string;
  };
  amount: number;
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
}

export function PesaPalPayment({ bookingData, amount, onSuccess, onBack }: PesaPalPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'mtn' | 'card' | 'bank'>('mtn');
  const [terms, setTerms] = useState(false);

  const handlePayment = async () => {
    if (!terms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (amount === 0) {
      setError('Please contact sales for bookings longer than 4 hours');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const merchantRef = generateMerchantReference();
      const formattedPhone = formatPhoneForPesaPal(bookingData.phone);

      const paymentRequest = {
        id: `booking-${Date.now()}`,
        reference: merchantRef,
        amount: amount,
        description: `Pitch Booking - ${bookingData.pitch} on ${bookingData.date} at ${bookingData.time}`,
        currency: 'RWF',
        email: bookingData.email,
        phone: formattedPhone,
        first_name: bookingData.name.split(' ')[0],
        last_name: bookingData.name.split(' ').slice(1).join(' ') || 'User',
        callBackUrl: `${window.location.origin}/payment/callback?ref=${merchantRef}`,
        redirectMode: 'REDIRECT' as const,
      };

      const response = await initiatePesaPalPayment(paymentRequest);

      if (response.error) {
        setError(response.message || 'Payment initiation failed. Please try again.');
        setLoading(false);
        return;
      }

      if (response.data?.redirect_url) {
        // Store the merchant reference and tracking ID in sessionStorage for later verification
        sessionStorage.setItem('pesapal_merchant_ref', merchantRef);
        sessionStorage.setItem('pesapal_tracking_id', response.data.order_tracking_id);
        sessionStorage.setItem('booking_data', JSON.stringify(bookingData));

        // Redirect to PesaPal payment page
        window.location.href = response.data.redirect_url;
      } else {
        setError('Failed to get payment redirect URL. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 font-semibold mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Details
      </button>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Pitch Type:</span>
            <span className="font-semibold text-gray-900">{bookingData.pitch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-semibold text-gray-900">{bookingData.date} at {bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-900">{bookingData.duration} hours</span>
          </div>
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">RWF {amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* MTN Momo Option */}
          <button
            onClick={() => setPaymentMethod('mtn')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'mtn'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 font-bold text-xs">MTN</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">MTN MoMo</p>
            <p className="text-xs text-gray-600">Mobile Money</p>
          </button>

          {/* M-Pesa Option */}
          <button
            onClick={() => setPaymentMethod('mpesa')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'mpesa'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-xs">M-PESA</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">M-Pesa</p>
            <p className="text-xs text-gray-600">Instant</p>
          </button>

          {/* Card Option */}
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Card</p>
            <p className="text-xs text-gray-600">Visa/MC</p>
          </button>

          {/* Bank Option */}
          <button
            onClick={() => setPaymentMethod('bank')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'bank'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">🏦</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">Bank</p>
            <p className="text-xs text-gray-600">Transfer</p>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">Secure Payment</p>
          <p className="text-blue-700 text-sm">
            All payments are processed securely through PesaPal. Your payment information is encrypted and protected.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Payment Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="w-5 h-5 text-green-600 rounded mt-1"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the <a href="#" className="text-green-600 hover:underline font-semibold">terms and conditions</a> and <a href="#" className="text-green-600 hover:underline font-semibold">privacy policy</a>
        </label>
      </div>

      {/* Complete Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !terms}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader className="w-5 h-5 animate-spin" />}
        {loading ? 'Processing Payment...' : `Complete Payment - RWF ${amount.toLocaleString()}`}
      </button>

      {/* Info Text */}
      <p className="text-center text-sm text-gray-600">
        You will be redirected to PesaPal to complete your payment
      </p>
    </div>
  );
}
