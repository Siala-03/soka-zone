import React, { useState } from 'react';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { PaymentVerification } from '../components/PaymentVerification';
import { calculateBookingPrice } from '../utils/pricing';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Local assets
const heroImage = "/assets/field2.jpeg";

export function BookPage() {
  const [pitchType, setPitchType] = useState<string>('Standard');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [showContactSales, setShowContactSales] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Payment verification state
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  const [merchantReference, setMerchantReference] = useState<string>('');
  const [savingBooking, setSavingBooking] = useState<boolean>(false);

  const amount = showContactSales ? 0 : calculateBookingPrice(pitchType as any, duration);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleBookingComplete = (data: typeof formData) => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }
    if (!data.name || !data.email || !data.phone) {
      alert('Please fill in all required fields');
      return;
    }
    setFormData(data);

    // Generate tracking IDs for payment verification
    const trackingId = `booking-${Date.now()}`;
    const reference = `REF-${Date.now()}`;

    setOrderTrackingId(trackingId);
    setMerchantReference(reference);

    // Open PesaPal payment link
    window.open('https://store.pesapal.com/sokazonepayment', '_blank');

    // Go to verification step
    setCurrentStep('verification');
  };

  const handlePaymentVerified = async (paymentStatus: any) => {
    setSavingBooking(true);
    try {
      // Save the booking to Firebase
      await addDoc(collection(db, 'bookings'), {
        date: selectedDate,
        time: selectedTime,
        duration: duration,
        pitch: pitchType,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        status: 'confirmed',
        merchantReference: merchantReference,
        orderTrackingId: orderTrackingId,
        paymentStatus: paymentStatus.order_status,
        amount: amount,
        createdAt: new Date(),
        paymentDate: paymentStatus.payment_date || new Date(),
      });

      // Payment successful - go to confirmation
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Payment successful but there was an error saving your booking. Please contact support with reference: ' + merchantReference);
      setCurrentStep('confirmation');
    } finally {
      setSavingBooking(false);
    }
  };

  const handleRetryPayment = () => {
    // Go back to booking to try again
    setCurrentStep('booking');
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
          {/* Booking Card */}
          <div className="card bg-white max-w-4xl mx-auto">
            <div className="animate-fade-in">
              
              {/* BOOKING STEP: Booking Form */}
              {currentStep === 'booking' && (
                <>
                  {/* Booking Form */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Pitch</h2>
                    <p className="text-gray-600">Select pitch, date, time, and provide your details</p>
                  </div>

                  {/* Pitch Type Selection */}
                  <div className="mb-8">
                    <label className="block font-bold text-gray-900 mb-3">Pitch Type</label>
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

                  {/* Duration Selection */}
                  <div className="mb-8">
                    <label className="block font-bold text-gray-900 mb-3">Duration</label>
                    <div className="flex gap-3 flex-wrap">
                      {[2, 3, 4].map(hrs => (
                        <button
                          key={hrs}
                          onClick={() => {
                            setDuration(hrs);
                            setShowContactSales(false);
                          }}
                          className={`flex-1 min-w-[120px] py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                            duration === hrs && !showContactSales
                              ? 'border-green-600 bg-green-50 text-green-700'
                              : 'border-gray-100 bg-gray-50 hover:border-green-400 hover:bg-white text-gray-600'
                          }`}
                        >
                          {hrs}h<br/><span className="text-sm">RWF {calculateBookingPrice(pitchType as any, hrs).toLocaleString()}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setShowContactSales(true);
                          setDuration(0);
                        }}
                        className={`flex-1 min-w-[120px] py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                          showContactSales
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 bg-gray-50 hover:border-blue-400 hover:bg-white text-gray-600'
                        }`}
                      >
                        5h+<br/><span className="text-sm">Contact Sales</span>
                      </button>
                    </div>
                    {showContactSales && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-blue-800 text-sm">
                          For bookings longer than 4 hours, please contact our sales team.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <a href="tel:+250792887614" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Call Sales
                          </a>
                          <a href="mailto:sales@skzone.rw" className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Email Sales
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calendar & Time Selection */}
                  <div className="mb-8">
                    <label className="block font-bold text-gray-900 mb-3">Select Date & Time</label>
                    <BookingCalendar 
                      pitchType={pitchType} 
                      duration={duration}
                      onDateTimeSelect={handleDateTimeSelect}
                    />
                  </div>

                  {/* User Details */}
                  <div className="mb-8 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Details</h3>
                    <div className="space-y-4">
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
                            placeholder="+250 7XX XXX XXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="Any special requests..."
                          rows={3}
                        />
                      </div>
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
                        <span className="font-semibold">{selectedDate ? `${selectedDate} at ${selectedTime}` : 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{duration} hours</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {showContactSales ? 'Contact Sales' : `RWF ${amount.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <button
                    disabled={!selectedDate || !selectedTime || showContactSales}
                    onClick={() => handleBookingComplete(formData)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    Pay with PesaPal
                  </button>
                </>
              )}

              {/* VERIFICATION STEP: Payment Verification */}
              {currentStep === 'verification' && (
                <PaymentVerification
                  orderTrackingId={orderTrackingId}
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
                  onSuccess={handlePaymentVerified}
                  onRetry={handleRetryPayment}
                  savingBooking={savingBooking}
                />
              )}

              {/* CONFIRMATION STEP: Booking Confirmed */}
              {currentStep === 'confirmation' && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600">Your payment has been successfully processed.</p>
                  </div>

                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-w-md mx-auto">
                    <h3 className="font-bold text-gray-900 mb-4">Booking Details</h3>
                    <div className="space-y-2 text-sm text-left">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono">{merchantReference}</span>
                      </div>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-green-600">RWF {amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Book Another Pitch
                  </button>
                </div>
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
                <span className="text-green-600 text-2xl">⏰</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Book Early</h3>
              <p className="text-gray-600 text-sm">After-work hours, evenings, and weekends fill fast. Don't wait.</p>
            </div>

            {/* Instant Confirmation */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">✓</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Confirmation</h3>
              <p className="text-gray-600 text-sm">Get your booking code immediately after payment.</p>
            </div>

            {/* Secure Payment */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🔒</span>
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
