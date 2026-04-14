import { useState } from 'react';
import { BookingCalendar } from '../components/BookingCalendar';
import { PesaPalPayment } from '../components/PesaPalPayment';
import { PaymentVerification } from '../components/PaymentVerification';
import { calculateBookingPrice } from '../utils/pricing';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const heroImage = '/assets/field2.jpeg';

type BookingSelection = {
  date: string;
  time: string;
  duration: number;
  pitch: string;
  notes?: string;
};

type BookingData = BookingSelection & {
  name: string;
  phone: string;
  email: string;
};

type PaymentSession = {
  merchantReference: string;
  orderTrackingId: string;
  redirectUrl: string;
  bookingData: BookingData;
};

type PaymentInitiatedPayload = {
  merchantReference: string;
  orderTrackingId: string;
  redirectUrl: string;
  bookingData: BookingSelection & {
    name?: string;
    phone?: string;
    email?: string;
  };
};

export function BookPage() {
  const [pitchType, setPitchType] = useState<string>('Standard');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [showContactSales, setShowContactSales] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'booking' | 'payment' | 'verification' | 'confirmation'>('booking');

  const [notes, setNotes] = useState('');
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [savingBooking, setSavingBooking] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const amount = showContactSales ? 0 : calculateBookingPrice(pitchType as any, duration);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleBookingSubmit = () => {
    if (showContactSales) {
      window.location.href = 'mailto:sales@skzone.rw';
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time before continuing.');
      return;
    }

    setBookingSelection({
      pitch: pitchType,
      duration,
      date: selectedDate,
      time: selectedTime,
      notes: notes.trim() || undefined,
    });
    setCurrentStep('payment');
  };

  const handlePaymentInitiated = (session: PaymentInitiatedPayload) => {
    if (!session.bookingData.name || !session.bookingData.phone || !session.bookingData.email) {
      setSaveError('Missing booking contact details. Please try again.');
      return;
    }

    setBookingData({
      ...session.bookingData,
      name: session.bookingData.name,
      phone: session.bookingData.phone,
      email: session.bookingData.email,
    });
    setPaymentSession({
      merchantReference: session.merchantReference,
      orderTrackingId: session.orderTrackingId,
      redirectUrl: session.redirectUrl,
      bookingData: {
        ...session.bookingData,
        name: session.bookingData.name,
        phone: session.bookingData.phone,
        email: session.bookingData.email,
      },
    });
    setCurrentStep('verification');
  };

  const handlePaymentVerified = async (paymentStatus: any) => {
    if (!bookingData || !paymentSession) return;

    setSavingBooking(true);
    setSaveError(null);

    try {
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'confirmed',
        merchantReference: paymentSession.merchantReference,
        orderTrackingId: paymentSession.orderTrackingId,
        paymentStatus: paymentStatus.order_status,
        amount,
        createdAt: new Date(),
        paymentDate: paymentStatus.payment_date || new Date(),
      });
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error saving booking:', error);
      setSaveError('Booking save failed. Please contact support if the payment was successful.');
      setCurrentStep('confirmation');
    } finally {
      setSavingBooking(false);
    }
  };

  const handleRestart = () => {
    setPitchType('Standard');
    setSelectedDate('');
    setSelectedTime('');
    setDuration(2);
    setShowContactSales(false);
    setNotes('');
    setBookingSelection(null);
    setBookingData(null);
    setPaymentSession(null);
    setSaveError(null);
    setCurrentStep('booking');
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
            <p className="text-xl text-white/95 mb-6">
              Choose your slot, continue to secure checkout, and complete payment through PesaPal card checkout.
            </p>
            <div className="flex justify-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-200" /> Secure checkout
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-200" /> Rwanda-friendly payment
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-200" /> Instant booking
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-8 lg:p-10">
                {currentStep === 'booking' && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Pitch</h2>
                      <p className="text-gray-600">Select your pitch, choose a time, and continue to payment when you are ready.</p>
                    </div>

                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Pitch Type</label>
                        <select
                          value={pitchType}
                          onChange={(e) => setPitchType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600"
                        >
                          <option value="Standard">Standard 5-a-side (RWF 1,000/hour)</option>
                          <option value="Premium">Premium Full-size (RWF 1,000/hour)</option>
                          <option value="Championship">Championship Pro (RWF 1,000/hour)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[2, 3, 4].map((hrs) => (
                            <button
                              key={hrs}
                              type="button"
                              onClick={() => {
                                setDuration(hrs);
                                setShowContactSales(false);
                              }}
                              className={`rounded-2xl border px-4 py-3 text-left transition ${
                                duration === hrs && !showContactSales
                                  ? 'border-green-600 bg-green-50 text-green-900'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-400 hover:bg-white'
                              }`}
                            >
                              <div className="text-lg font-bold">{hrs}h</div>
                              <div className="text-sm text-gray-500">RWF {calculateBookingPrice(pitchType as any, hrs).toLocaleString()}</div>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setShowContactSales(true);
                              setDuration(0);
                            }}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              showContactSales
                                ? 'border-blue-600 bg-blue-50 text-blue-900'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-white'
                            }`}
                          >
                            <div className="text-lg font-bold">5h+</div>
                            <div className="text-sm text-gray-500">Contact Sales</div>
                          </button>
                        </div>

                        {showContactSales && (
                          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                            For longer bookings, contact our team to get the best slot and pricing.
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Select Date & Time</label>
                        <BookingCalendar pitchType={pitchType} duration={duration} onDateTimeSelect={handleDateTimeSelect} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-green-600"
                          rows={4}
                          placeholder="Tell us if you need equipment, referees, or special arrangements"
                        />
                      </div>
                    </div>

                    <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Estimated total</p>
                          <p className="text-3xl font-bold text-green-700">RWF {amount.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={handleBookingSubmit}
                          className="rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-green-700"
                        >
                          {showContactSales ? 'Contact Sales' : 'Continue to Payment'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 'payment' && bookingSelection && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
                      <p className="text-gray-600">Add the booking contact we should use, then continue to secure PesaPal checkout.</p>
                    </div>
                    <PesaPalPayment
                      bookingData={bookingSelection}
                      amount={amount}
                      onBack={() => setCurrentStep('booking')}
                      onPaymentInitiated={handlePaymentInitiated}
                    />
                  </div>
                )}

                {currentStep === 'verification' && paymentSession && bookingData && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Payment</h2>
                      <p className="text-gray-600">After completing your PesaPal payment, return here and let us confirm your booking automatically.</p>
                    </div>
                    <PaymentVerification
                      orderTrackingId={paymentSession.orderTrackingId}
                      merchantReference={paymentSession.merchantReference}
                      amount={amount}
                      bookingData={bookingData}
                      onSuccess={handlePaymentVerified}
                      onRetry={() => setCurrentStep('payment')}
                      savingBooking={savingBooking}
                    />
                  </div>
                )}

                {currentStep === 'confirmation' && bookingData && paymentSession && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-gray-900">Booking Confirmed</h2>
                      <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                        Your booking is confirmed and your payment has been verified. Please save your reference number.
                      </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Booking Details</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div className="flex justify-between">
                            <span>Pitch</span>
                            <span className="font-semibold">{bookingData.pitch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date</span>
                            <span className="font-semibold">{bookingData.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time</span>
                            <span className="font-semibold">{bookingData.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration</span>
                            <span className="font-semibold">{bookingData.duration} hours</span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-green-200">
                            <span className="font-semibold">Paid</span>
                            <span className="font-semibold text-green-700">RWF {amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-gray-200 bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Reference</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div>
                            <p className="text-gray-500">Merchant reference</p>
                            <p className="font-mono break-all">{paymentSession.merchantReference}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">PesaPal tracking ID</p>
                            <p className="font-mono break-all">{paymentSession.orderTrackingId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Customer</p>
                            <p>{bookingData.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p>{bookingData.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {saveError && (
                      <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {saveError}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button
                        onClick={handleRestart}
                        className="rounded-2xl border border-green-600 bg-white px-6 py-4 font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        Book Another Slot
                      </button>
                      <a
                        href={`mailto:support@skzone.rw?subject=Booking%20Reference%20${paymentSession.merchantReference}`}
                        className="rounded-2xl bg-green-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-green-700"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block bg-green-600 p-8 text-white">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-green-200">Soka Zone Booking</p>
                    <h3 className="mt-3 text-2xl font-bold">Easy booking. Trusted payment.</h3>
                  </div>
                  <div className="space-y-4 text-sm leading-7">
                    <p>Continue to the hosted PesaPal payment page and complete the booking with card payment.</p>
                    <p>Your booking contact is collected during the payment step, not on the slot selection screen.</p>
                    <p>After payment, return to this page to verify and confirm your booking.</p>
                  </div>
                  <div className="rounded-3xl border border-white/20 bg-white/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-200">Booking steps</p>
                    <ol className="mt-4 space-y-3 text-sm text-white/90">
                      <li>1. Select your slot</li>
                      <li>2. Review payment contact</li>
                      <li>3. Continue to PesaPal</li>
                      <li>4. Confirm your booking</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}