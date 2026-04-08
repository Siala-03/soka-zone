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
  duration: number;
  pitch: string;
  name: string;
  phone: string;
  email: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingCalendarProps {
  pitchType: string;
  duration?: number;
  onDateTimeSelect?: (date: string, time: string) => void;
}

// Generate time slots from 6 AM to 10 PM
const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', 
  '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export function BookingCalendar({ pitchType = 'Standard', duration = 2, onDateTimeSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch bookings for selected date and pitch
  useEffect(() => {
    fetchBookings();
  }, [selectedDate, pitchType, duration]);

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

  // Check if a time slot is booked (either directly or as part of a longer booking)
  const isSlotBooked = (time: string) => {
    const timeHour = parseInt(time.split(':')[0]);
    
    // Check if this slot is the start of a booked duration
    const asStartSlot = bookings.some(b => {
      if (b.status === 'cancelled') return false;
      const bookingHour = parseInt(b.time.split(':')[0]);
      const bookingDuration = b.duration || 2;
      return bookingHour === timeHour;
    });
    
    if (asStartSlot) return true;
    
    // Check if this slot falls within an existing booking's duration
    return bookings.some(b => {
      if (b.status === 'cancelled') return false;
      const bookingHour = parseInt(b.time.split(':')[0]);
      const bookingDuration = b.duration || 2;
      return timeHour > bookingHour && timeHour < (bookingHour + bookingDuration);
    });
  };

  // Check if a slot can be booked for the given duration (all consecutive slots available)
  const canBookSlot = (time: string, dur: number) => {
    const timeHour = parseInt(time.split(':')[0]);
    const endHour = timeHour + dur;
    
    // Check if all slots in the duration range are available
    for (let h = timeHour; h < endHour; h++) {
      const slotTime = `${h.toString().padStart(2, '0')}:00`;
      if (isSlotBooked(slotTime)) return false;
    }
    return true;
  };

  const handleSlotClick = (time: string) => {
    const isPastSlot = isPast(addHours(startOfDay(selectedDate), parseInt(time.split(':')[0])));
    if (!isSlotBooked(time) && !isPastSlot && canBookSlot(time, duration)) {
      setSelectedTime(time);
      // Call the callback to communicate selection back to parent
      if (onDateTimeSelect) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        onDateTimeSelect(dateStr, time);
      }
      setShowForm(true);
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
          
          const blockedByDuration = booked && !canBookSlot(time, duration);
          const cannotBook = booked || isPastSlot || !canBookSlot(time, duration);
          
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(time)}
              disabled={cannotBook}
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
              {blockedByDuration && <div className="text-xs">Blocked</div>}
              {booked && !blockedByDuration && <div className="text-xs">Booked</div>}
            </button>
          );
        })}
      </div>


    </div>
  );
}
