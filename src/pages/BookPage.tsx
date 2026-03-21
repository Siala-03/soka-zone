import React, { useState } from 'react';
import { CheckCircle2, Calendar as CalendarIcon, Clock, CalendarCheck, CreditCard, AlertCircle } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';

// Local assets
const heroImage = "/assets/small_pitch2.webp";

export function BookPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [showComingSoon, setShowComingSoon] = useState<boolean>(false);

  const timeSlots = [
    '06:00 AM',
    '07:00 AM',
    '08:00 AM',
    '09:00 AM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
    '10:00 PM'
  ];

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
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 bg-green-600 text-white shadow-lg scale-110">
                  1
                </div>
                <div className="w-20 h-1.5 rounded-full transition-all duration-500 bg-gray-200"></div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 bg-gray-200 text-gray-400">
                  2
                </div>
                <div className="w-20 h-1.5 rounded-full transition-all duration-500 bg-gray-200"></div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 bg-gray-200 text-gray-400">
                  3
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <div className="text-center bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Step 1: Choose Date & Time</span>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="card bg-white max-w-4xl mx-auto">
            <div className="animate-fade-in">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Book Your Pitch</h2>
                  <p className="text-gray-600">Select your preferred date and time slot</p>
                </div>
              </div>



              {/* Booking Calendar */}
              <BookingCalendar duration={duration} />

              {/* Duration */}
              <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                  Duration
                </h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDuration(2)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                      duration === 2 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-100 bg-gray-50 hover:border-green-400 hover:bg-white text-gray-600'
                    }`}
                  >
                    2h
                  </button>
                  <button 
                    onClick={() => setDuration(3)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                      duration === 3 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-100 bg-gray-50 hover:border-green-400 hover:bg-white text-gray-600'
                    }`}
                  >
                    3h
                  </button>
                  <button 
                    onClick={() => setDuration(4)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                      duration === 4 
                        ? 'border-green-600 bg-green-50 text-green-700' 
                        : 'border-gray-100 bg-gray-50 hover:border-green-400 hover:bg-white text-gray-600'
                    }`}
                  >
                    4h
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-12 flex justify-end">
                <button 
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => alert('Please call +250 792 887 614 to confirm your booking')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                >
                  Continue to Details
                </button>
              </div>

              {/* Coming Soon Message */}
              {showComingSoon && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-yellow-800 font-semibold">This online booking feature is coming soon!</span>
                  </div>
                  <p className="text-yellow-700 text-center mt-2 text-sm">Please call <a href="tel:+250792887614" className="font-bold underline">+250 792 887 614</a> to make a booking.</p>
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
              <p className="text-gray-600 text-sm">Safe and secure payment via MoMo or Visa.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
