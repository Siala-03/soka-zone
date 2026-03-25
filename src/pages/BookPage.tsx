import React, { useState, useEffect } from 'react';
import { CheckCircle2, Calendar as CalendarIcon, Clock, CalendarCheck, CreditCard, AlertCircle, User, Mail, Phone } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { PesaPalPayment } from '../components/PesaPalPayment';
import { PaymentConfirmation } from '../components/PaymentConfirmation';
import { calculateBookingPrice } from '../utils/pricing';

// Local assets
const heroImage = "/assets/field2.jpeg";

type BookingStep = 'calendar' | 'details' | 'payment' | 'confirmation';

export function BookPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [pitchType, setPitchType] = useState<string>('Standard');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [showContactSales, setShowContactSales] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Payment confirmation state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState<string>('');
  const [merchantReference, setMerchantReference] = useState<string>('');

  // Check if we're coming back from a payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get('tracking_id');
    const merchantRef = params.get('merchant_reference');

    if (trackId && merchantRef) {
      setTrackingId(trackId);
      setMerchantReference(merchantRef);
      setCurrentStep('confirmation');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const amount = showContactSales ? 0 : calculateBookingPrice(pitchType as any, duration);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleContinueToDetails = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }
    setDetailsModalOpen(true);
  };

  const handleDetailsContinue = (data: typeof formData) => {
    if (!data.name || !data.email || !data.phone) {
      alert('Please fill in all required fields');
      return;
    }
    setFormData(data);
    setDetailsModalOpen(false);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (txId: string) => {
    setTrackingId(txId);
    setCurrentStep('confirmation');
    setPaymentSuccess(true);
  };

  const handleNewBooking = () => {
    setCurrentStep('calendar');
    setSelectedDate('');
    setSelectedTime('');
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setPaymentSuccess(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px]">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Teams ready to play at Soka Zone" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-blue-900/80"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lock In the Game Before Someone Else Does
            </h1>
            <p className="text-xl text-white/95 mb-6">
              The best games happen because the pitch was booked, the time was fixed, and the players showed up.
            </p>
            <div className="flex justify-center gap-4 text-white/90 text-sm">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instant Confirmation
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure Payment
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  ['calendar', 'details', 'payment', 'confirmation'].indexOf(currentStep) >= 0
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1.5 rounded-full transition-all duration-500 ${
                  ['details', 'payment', 'confirmation'].indexOf(currentStep) >= 0
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  ['details', 'payment', 'confirmation'].indexOf(currentStep) >= 0
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
                <div className={`w-16 h-1.5 rounded-full transition-all duration-500 ${
                  ['payment', 'confirmation'].indexOf(currentStep) >= 0
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  ['payment', 'confirmation'].indexOf(currentStep) >= 0
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  3
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <div className="text-center bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {currentStep === 'calendar' && 'Step 1: Choose Date & Time'}
                  {currentStep === 'details' && 'Step 2: Your Details'}
                  {currentStep === 'payment' && 'Step 3: Complete Payment'}
                  {currentStep === 'confirmation' && 'Booking Confirmed!'}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="card bg-white max-w-4xl mx-auto">
            <div className="animate-fade-in">
              
              {/* STEP 1: Calendar & Time Selection */}
              {currentStep === 'calendar' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Pitch</h2>
                    <p className="text-gray-600">Select your preferred date and time slot</p>
                  </div>

                  <div className="mb-6">
                    <label className="block font-bold text-gray-900 mb-2">Pitch Type</label>
                    <select
                      value={pitchType}
                      onChange={(e) => setPitchType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    >
                      <option value="Standard">Standard 5-a-side (RWF 35,000/hour)</option>
                      <option value="Premium">Premium Full-size (RWF 35,000/hour)</option>
                      <option value="Championship">Championship Pro (RWF 35,000/hour)</option>
                    </select>
                  </div>

                  <BookingCalendar 
                    pitchType={pitchType} 
                    duration={duration}
                    onDateTimeSelect={handleDateTimeSelect}
                  />

                  <div className="mt-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                      Duration
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      {[2, 3, 4].map(hrs => (
                        <button
                          key={hrs}
                          onClick={() => {
                            setDuration(hrs);
                            setShowContactSales(false);
                          }}
                          className={`flex-1 min-w-[100px] py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                            duration === hrs && !showContactSales
                              ? 'border-green-600 bg-green-50 text-green-700'
                              : 'border-gray-100 bg-gray-50 hover:border-green-400 hover:bg-white text-gray-600'
                          }`}
                        >
                          {hrs}h - RWF {calculateBookingPrice(pitchType as any, hrs).toLocaleString()}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setShowContactSales(true);
                          setDuration(0);
                        }}
                        className={`flex-1 min-w-[100px] py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                          showContactSales
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 bg-gray-50 hover:border-blue-400 hover:bg-white text-gray-600'
                        }`}
                      >
                        5h+ - Contact Sales
                      </button>
                    </div>
                    {showContactSales && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-blue-800 text-sm">
                          For bookings longer than 4 hours, please contact our sales team for special pricing and availability.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <a
                            href="tel:+250792887614"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Call +250 792 887 614
                          </a>
                          <a
                            href="mailto:sales@skzone.rw"
                            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Email Sales
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      disabled={!selectedDate || !selectedTime || showContactSales}
                      onClick={handleContinueToDetails}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                    >
                      {showContactSales ? 'Contact Sales First' : 'Fill Details (Pop-out)'}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: Details Form */}
              {detailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setDetailsModalOpen(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                    <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Full Name *</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Email *</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Phone *</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+250 7XX XXX XXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Notes</label>
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          placeholder="Any special requests..."
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        onClick={() => setDetailsModalOpen(false)}
                        className="px-4 py-2 rounded-lg border border-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDetailsContinue(formData)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'details' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Details</h2>
                    <p className="text-gray-600">Please provide your contact information</p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="+254 7XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                        placeholder="Any special requests or notes..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pitch:</span>
                        <span className="font-semibold">{pitchType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-semibold">{selectedDate} at {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{duration} hours</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-600">
                          RWF {showContactSales ? 'Contact Sales' : amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setCurrentStep('calendar')}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleDetailsContinue(formData)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3: Payment */}
              {currentStep === 'payment' && (
                <PesaPalPayment
                  bookingData={{
                    date: selectedDate,
                    time: selectedTime,
                    duration,
                    pitch: pitchType,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                  }}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep('details')}
                />
              )}

              {/* STEP 4: Confirmation */}
              {currentStep === 'confirmation' && (
                <PaymentConfirmation
                  trackingId={trackingId}
                  merchantReference={merchantReference}
                  amount={amount}
                  bookingData={{
                    date: selectedDate,
                    time: selectedTime,
                    duration,
                    pitch: pitchType,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                  }}
                  onNewBooking={handleNewBooking}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Early */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Book Early</h3>
              <p className="text-gray-600 text-sm">After-work hours, evenings, and weekends fill fast. Don't wait.</p>
            </div>

            {/* Instant Confirmation */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Confirmation</h3>
              <p className="text-gray-600 text-sm">Get your booking code immediately after payment.</p>
            </div>

            {/* Secure Payment */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Safe and secure payment via PesaPal, M-Pesa, or Visa.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
