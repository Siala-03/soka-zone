import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isPast,
  addHours,
  startOfDay
} from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  time: string;
  pitch: string;
  name: string;
  phone: string;
  email: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingCalendarProps {
  pitchType: string;
}

// Generate time slots from 6 AM to 10 PM
const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', 
  '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export function BookingCalendar({ pitchType }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch bookings for selected date and pitch
  useEffect(() => {
    fetchBookings();
  }, [selectedDate, pitchType]);

  const fetchBookings = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const q = query(
        collection(db, 'bookings'),
        where('date', '==', dateStr),
        where('pitch', '==', pitchType)
      );
      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // For demo purposes, use mock data if Firebase is not configured
      setBookings([]);
    }
  };

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  const isSlotBooked = (time: string) => {
    return bookings.some(b => b.time === time && b.status !== 'cancelled');
  };

  const handleSlotClick = (time: string) => {
    if (!isSlotBooked(time) && !isPast(addHours(startOfDay(selectedDate), parseInt(time.split(':')[0])))) {
      setSelectedTime(time);
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const booking = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime!,
        pitch: pitchType,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'bookings'), booking);
      
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        fetchBookings();
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToPrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goToPrevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {format(currentWeekStart, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`p-2 rounded-lg text-center transition-all ${
              isSameDay(day, selectedDate) 
                ? 'bg-green-600 text-white' 
                : isPast(day) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-green-50'
            }`}
            disabled={isPast(day)}
          >
            <div className="text-xs">{format(day, 'EEE')}</div>
            <div className="text-lg font-bold">{format(day, 'd')}</div>
          </button>
        ))}
      </div>

      {/* Selected Date Display */}
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Calendar className="w-5 h-5" />
        <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-4 gap-3">
        {timeSlots.map((time) => {
          const booked = isSlotBooked(time);
          const isPastSlot = isPast(addHours(startOfDay(selectedDate), parseInt(time.split(':')[0])));
          
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(time)}
              disabled={booked || isPastSlot}
              className={`p-3 rounded-lg text-center transition-all ${
                booked 
                  ? 'bg-red-100 text-red-600 cursor-not-allowed'
                  : isPastSlot
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-50 hover:bg-green-100 text-green-700'
              }`}
            >
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <span className="font-medium">{time}</span>
              {booked && <div className="text-xs">Booked</div>}
            </button>
          );
        })}
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">
                  Your pitch is booked for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">Complete Booking</h3>
                <p className="text-gray-600 mb-6">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+250 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      placeholder="Any special requests?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
