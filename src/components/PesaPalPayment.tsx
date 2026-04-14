import { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import {
  initiatePesaPalPayment,
  generateMerchantReference,
  formatPhoneForPesaPal,
} from '../utils/pesapal';

interface BookingData {
  date: string;
  time: string;
  duration: number;
  pitch: string;
  notes?: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface PaymentInitiatedPayload {
  merchantReference: string;
  orderTrackingId: string;
  redirectUrl: string;
  bookingData: BookingData;
}

interface PesaPalPaymentProps {
  bookingData: BookingData;
  amount: number;
  onBack: () => void;
  onPaymentInitiated?: (payload: PaymentInitiatedPayload) => void;
}

export function PesaPalPayment({ bookingData, amount, onBack, onPaymentInitiated }: PesaPalPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [showRedirectPanel, setShowRedirectPanel] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: bookingData.name || '',
    email: bookingData.email || '',
    phone: bookingData.phone || '',
  });

  const handlePayment = async () => {
    if (!customerDetails.name.trim() || !customerDetails.email.trim() || !customerDetails.phone.trim()) {
      setError('Please add your name, email address, and phone number before continuing.');
      return;
    }

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
      const formattedPhone = formatPhoneForPesaPal(customerDetails.phone);
      const nameParts = customerDetails.name.trim().split(/\s+/);
      const completedBookingData = {
        ...bookingData,
        name: customerDetails.name.trim(),
        email: customerDetails.email.trim(),
        phone: formattedPhone,
      };

      const paymentRequest = {
        id: `booking-${Date.now()}`,
        reference: merchantRef,
        amount,
        description: `Pitch Booking - ${bookingData.pitch} on ${bookingData.date} at ${bookingData.time}`,
        currency: 'RWF',
        email: customerDetails.email.trim(),
        phone: formattedPhone,
        first_name: nameParts[0] || 'Customer',
        last_name: nameParts.slice(1).join(' ') || 'User',
        callBackUrl: `${window.location.origin}/payment/callback?ref=${merchantRef}`,
        redirectMode: 'REDIRECT' as const,
      };

      console.log('Initiating payment request:', {
        merchantRef,
        amount,
        selectedMethod: 'card',
        phone: formattedPhone.replace(/\d(?=\d{4})/g, '*'),
      });

      const response = await initiatePesaPalPayment(paymentRequest);

      if (response.error) {
        setError(response.message || 'Payment initiation failed. Please try again.');
        setLoading(false);
        return;
      }

      if (response.data?.redirect_url) {
        sessionStorage.setItem('pesapal_merchant_ref', merchantRef);
        sessionStorage.setItem('pesapal_tracking_id', response.data.order_tracking_id);
        sessionStorage.setItem('booking_data', JSON.stringify(completedBookingData));
        setPaymentRedirectUrl(response.data.redirect_url);
        setShowRedirectPanel(true);
        setLoading(false);

        onPaymentInitiated?.({
          merchantReference: merchantRef,
          orderTrackingId: response.data.order_tracking_id,
          redirectUrl: response.data.redirect_url,
          bookingData: completedBookingData,
        });

        const popup = window.open(response.data.redirect_url, '_blank');
        if (!popup) {
          setError('Please allow pop-ups or use the link below to continue payment.');
        }
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
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 font-semibold"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to details
      </button>

      {showRedirectPanel && paymentRedirectUrl ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Continue to PesaPal</h3>
          <p className="text-gray-600 mb-4">
            We opened the secure payment page in a new tab. If the page did not open, tap the button below.
          </p>
          <a
            href={paymentRedirectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold transition hover:bg-green-700"
          >
            Open PesaPal Checkout
          </a>
          <p className="mt-4 text-sm text-gray-500">
            After paying, return to this page and confirm your booking using the verification step.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Pitch type</span>
                <span className="font-semibold">{bookingData.pitch}</span>
              </div>
              <div className="flex justify-between">
                <span>Schedule</span>
                <span className="font-semibold">{bookingData.date} at {bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold">{bookingData.duration} hours</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-green-700">RWF {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Contact</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add the contact we should use for your booking before sending you to card checkout.
            </p>
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Full Name</label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails((current) => ({ ...current, name: e.target.value }))}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-green-600"
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Email Address</label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails((current) => ({ ...current, email: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-green-600"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Phone Number</label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails((current) => ({ ...current, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-green-600"
                    placeholder="+250 788 123 456"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
            <p className="font-semibold mb-2">Current checkout availability</p>
            <p>Pesapal has confirmed that live checkout is card-only for now. This button opens the current hosted card payment page.</p>
          </div>

          <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <p className="font-semibold mb-2">How payment works</p>
            <ol className="space-y-2 text-sm">
              <li>1. Add your booking contact.</li>
              <li>2. Continue to the hosted PesaPal card checkout.</li>
              <li>3. Finish the card payment securely.</li>
              <li>4. Return here to verify booking.</li>
            </ol>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the <a href="#" className="text-green-600 hover:underline">terms and conditions</a> and <a href="#" className="text-green-600 hover:underline">privacy policy</a>.
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !terms}
            className="w-full rounded-3xl bg-green-600 px-6 py-4 text-white font-semibold shadow-lg transition hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" /> Redirecting...
              </span>
            ) : (
              `Continue to Card Payment - RWF ${amount.toLocaleString()}`
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Secure payment powered by PesaPal. The next page is the current hosted card checkout.
          </p>
        </>
      )}
    </div>
  );
}
