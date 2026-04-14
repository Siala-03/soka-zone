import { useState } from 'react';
import { BookingCalendar } from '../components/BookingCalendar';
import { calculateBookingPrice } from '../utils/pricing';

const heroImage = '/assets/field2.jpeg';
const PESAPAL_PAYMENT_LINK = 'https://store.pesapal.com/sokazonepayment';

export function BookPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [showContactSales, setShowContactSales] = useState<boolean>(false);

  const amount = showContactSales ? 0 : calculateBookingPrice('Standard', duration);

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

    window.location.href = PESAPAL_PAYMENT_LINK;
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
            <p className="text-xl text-white/95">Choose your slot and continue to PesaPal.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Pitch</h2>
                <p className="text-gray-600">Choose a duration, select a time slot, and continue to payment.</p>
              </div>

              <div className="grid gap-6">
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
                            ? 'border-green-700 bg-green-100 text-green-950 shadow-sm'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-400 hover:bg-white'
                        }`}
                      >
                        <div className="text-lg font-bold">{hrs}h</div>
                        <div className="text-sm text-gray-500">RWF {calculateBookingPrice('Standard', hrs).toLocaleString()}</div>
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
                  <BookingCalendar duration={duration} onDateTimeSelect={handleDateTimeSelect} />
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}