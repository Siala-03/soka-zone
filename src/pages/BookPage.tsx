import { useState } from 'react';
import { BookingCalendar } from '../components/BookingCalendar';
import {
  ONLINE_BOOKING_DURATION_HOURS,
  SALES_PHONE,
  getBookingPriceQuote,
} from '../utils/pricing';
import { fetchMtnPaymentStatus, initiateMtnPayment } from '../utils/mtn';

const heroImage = '/assets/field2.jpeg';
const PAYMENT_POLL_ATTEMPTS = 8;
const PAYMENT_POLL_DELAY_MS = 3000;
const DEFAULT_MTN_PHONE = import.meta.env.VITE_MTN_SANDBOX_MSISDN || '250788123456';
const DEFAULT_MTN_CURRENCY = import.meta.env.VITE_MTN_CURRENCY || 'EUR';
const bookingRates = [
  { label: 'Mon-Thu 6am-4pm', amount: '50,000' },
  { label: 'Mon-Thu 4pm-10pm', amount: '70,000' },
  { label: 'Friday 6am-4pm', amount: '60,000' },
  { label: 'Friday 4pm-10pm', amount: '80,000' },
  { label: 'Weekend', amount: '80,000' },
];

export function BookPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(ONLINE_BOOKING_DURATION_HOURS);
  const [showContactSales, setShowContactSales] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string>('');

  const priceQuote = getBookingPriceQuote('Standard', duration, {
    date: selectedDate,
    startTime: selectedTime,
  });

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const wait = (delay: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, delay);
    });

  const handleBookingSubmit = async () => {
    if (showContactSales) {
      window.location.href = `tel:${SALES_PHONE}`;
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time before continuing.');
      return;
    }

    if (priceQuote.amount === null) {
      alert('Please select a valid booking slot to continue with payment.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatusMessage('Creating MTN payment request...');

    try {
      const payment = await initiateMtnPayment({
        amount: priceQuote.amount,
        currency: DEFAULT_MTN_CURRENCY,
        phone: DEFAULT_MTN_PHONE,
        payerMessage: `Soka Zone booking for ${selectedDate} at ${selectedTime}`,
        payeeNote: 'Soka Zone booking',
        externalId: `BOOK-${Date.now()}`,
      });

      let resolvedStatus: 'SUCCESSFUL' | 'FAILED' | 'PENDING' = 'PENDING';

      for (let attempt = 1; attempt <= PAYMENT_POLL_ATTEMPTS; attempt += 1) {
        setPaymentStatusMessage(`Waiting for MTN confirmation (${attempt}/${PAYMENT_POLL_ATTEMPTS})...`);
        await wait(PAYMENT_POLL_DELAY_MS);

        const status = await fetchMtnPaymentStatus(payment.referenceId);
        if (status.status === 'SUCCESSFUL' || status.status === 'FAILED') {
          resolvedStatus = status.status;
          break;
        }
      }

      if (resolvedStatus === 'SUCCESSFUL') {
        setPaymentStatusMessage('Payment successful. Booking can now be confirmed.');
        alert('MTN payment successful. Your booking is ready for confirmation.');
      } else if (resolvedStatus === 'FAILED') {
        setPaymentStatusMessage('Payment failed. Please retry.');
        alert('MTN payment failed. Please try again.');
      } else {
        setPaymentStatusMessage('Payment is still pending. Please check again shortly.');
        alert('Payment is still pending. You can retry status check in a few moments.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process MTN payment.';
      setPaymentStatusMessage(message);
      alert(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="relative h-[400px] md:h-[500px]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Teams ready to play at Soka Zone" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-blue-900/80" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book Your Pitch and Pay Securely</h1>
            <p className="text-xl text-white/95">Choose your slot and pay via MTN MoMo sandbox.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Pitch</h2>
                <p className="text-gray-600">Online booking is for 2-hour slots. For anything longer, call sales.</p>
              </div>

              <div className="mb-8 grid gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 md:grid-cols-2 xl:grid-cols-5">
                {bookingRates.map((rate) => (
                  <div
                    key={rate.label}
                    className={`rounded-2xl bg-white p-4 ${rate.label === 'Weekend' ? 'md:col-span-2 xl:col-span-1' : ''}`}
                  >
                    <div className="font-semibold text-gray-900">{rate.label}</div>
                    <div className="mt-3 text-2xl font-bold text-gray-900">RWF {rate.amount}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Per 2-hour slot</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDuration(ONLINE_BOOKING_DURATION_HOURS);
                        setShowContactSales(false);
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        !showContactSales
                          ? 'border-green-700 bg-green-100 text-green-950 shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-400 hover:bg-white'
                      }`}
                    >
                      <div className="text-lg font-bold">2h</div>
                      <div className="text-sm text-gray-500">Select a slot to see the total cost</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactSales(true);
                        setDuration(ONLINE_BOOKING_DURATION_HOURS);
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        showContactSales
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-white'
                      }`}
                    >
                      <div className="text-lg font-bold">More than 2h</div>
                      <div className="text-sm text-gray-500">Contact Sales</div>
                    </button>
                  </div>

                  {showContactSales && (
                    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                      For bookings longer than 2 hours, contact sales on {SALES_PHONE}.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Date & Time</label>
                  <BookingCalendar duration={duration} onDateTimeSelect={handleDateTimeSelect} />
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total cost</p>
                    {showContactSales ? (
                      <>
                        <p className="text-2xl font-bold text-blue-800">Call {SALES_PHONE}</p>
                        <p className="text-sm text-blue-700">Longer bookings are handled directly by sales.</p>
                      </>
                    ) : priceQuote.amount !== null ? (
                      <>
                        <p className="text-3xl font-bold text-green-700">RWF {priceQuote.amount.toLocaleString()}</p>
                        {priceQuote.rateLabel && <p className="text-sm text-gray-500">{priceQuote.rateLabel}</p>}
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-gray-600">Select a date and time to see the total cost.</p>
                    )}
                  </div>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={isProcessingPayment}
                    className="rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {showContactSales ? 'Contact Sales' : isProcessingPayment ? 'Processing Payment...' : 'Pay with MTN'}
                  </button>
                </div>
                {paymentStatusMessage && (
                  <p className="mt-4 text-sm text-gray-600">{paymentStatusMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}