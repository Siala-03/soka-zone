import { FormEvent, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Lock, LogOut, Plus, Trash2, XCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { SALES_PHONE, getBookingPriceQuote } from '../utils/pricing';

type BookingRecord = {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  pitch: string;
  name: string;
  phone: string;
  email: string;
  paymentReference?: string;
  amount?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
};

type AdminPageProps = {
  onBackHome: () => void;
};

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

const endTimeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
];

const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);

const ADMIN_USERNAME = 'admin';

function timeToHour(time: string): number {
  return Number.parseInt(time.split(':')[0], 10);
}

function hourToTime(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function calculateEndTime(startTime: string, hours: number): string {
  if (!startTime || hours <= 0) {
    return '';
  }

  return hourToTime(timeToHour(startTime) + hours);
}

function calculateHoursBetween(startTime: string, endTime: string): number {
  if (!startTime || !endTime) {
    return 0;
  }

  return timeToHour(endTime) - timeToHour(startTime);
}

export function AdminPage({ onBackHome }: AdminPageProps) {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    date: '',
    startTime: '',
    endTime: '',
    hours: 2,
    name: '',
    paymentReference: '',
  });

  const bookingPriceQuote = getBookingPriceQuote('Standard', formState.hours, {
    date: formState.date,
    startTime: formState.startTime,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(Boolean(user));
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    setActionError(null);

    try {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const records = snapshot.docs
        .map((bookingDoc) => ({ id: bookingDoc.id, ...bookingDoc.data() } as BookingRecord))
        .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`));

      setBookings(records);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setActionError('Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const normalizedIdentifier = loginIdentifier.trim();

    if (!adminEmail) {
      setAuthError('Admin email is not configured.');
      return;
    }

    const emailToUse = normalizedIdentifier.toLowerCase() === ADMIN_USERNAME
      ? adminEmail
      : normalizedIdentifier;

    try {
      await signInWithEmailAndPassword(auth, emailToUse, password);
      setAuthError(null);
      setPassword('');
    } catch (error) {
      console.error('Admin login failed:', error);
      setAuthError('Invalid administrator username or password.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginIdentifier('');
    setPassword('');
    setBookings([]);
    setActionError(null);
  };

  const handleCreateBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.date || !formState.startTime || !formState.endTime) {
      setActionError('Date, start time, and end time are required.');
      return;
    }

    const bookingHours = calculateHoursBetween(formState.startTime, formState.endTime);

    if (bookingHours <= 0 || bookingHours > 12) {
      setActionError('Booking hours must be between 1 and 12.');
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const bookingPayload = {
        date: formState.date,
        time: formState.startTime,
        endTime: formState.endTime,
        duration: bookingHours,
        pitch: 'Standard',
        name: formState.name.trim() || 'Confirmed booking',
        phone: '',
        email: '',
        paymentReference: formState.paymentReference.trim() || '',
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
        ...(bookingPriceQuote.amount !== null ? { amount: bookingPriceQuote.amount } : {}),
      };

      await addDoc(collection(db, 'bookings'), bookingPayload);

      setFormState({
        date: '',
        startTime: '',
        endTime: '',
        hours: 2,
        name: '',
        paymentReference: '',
      });

      await loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      setActionError('Failed to save booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setActionError('Failed to cancel booking.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      await loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      setActionError('Failed to delete booking.');
    }
  };

  if (!authReady) {
    return (
      <section className="bg-gray-50 min-h-screen py-16 px-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-gray-600">Loading admin access...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-gray-50 min-h-screen py-16 px-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Administrator Login</h1>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Username or Email</label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                autoComplete="username"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="w-full rounded-2xl border border-gray-300 px-6 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back to site
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">Admin</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Booking Control</h1>
            <p className="mt-2 text-gray-600">Use this page after payment confirmation to block the slot on the calendar.</p>
            {currentUser?.email && <p className="mt-2 text-sm text-gray-500">Signed in as {currentUser.email}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadBookings}
              className="rounded-2xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <Plus className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Add Confirmed Booking</h2>
            </div>

            <form className="space-y-4" onSubmit={handleCreateBooking}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Date</label>
                  <input
                    type="date"
                    value={formState.date}
                    onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Start Time</label>
                  <select
                    value={formState.startTime}
                    onChange={(event) => {
                      const nextStartTime = event.target.value;
                      const nextEndTime = calculateEndTime(nextStartTime, formState.hours);
                      const isValidEndTime = endTimeSlots.includes(nextEndTime);

                      setFormState((current) => ({
                        ...current,
                        startTime: nextStartTime,
                        endTime: isValidEndTime ? nextEndTime : '',
                      }));
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map((timeSlot) => (
                      <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">End Time</label>
                  <select
                    value={formState.endTime}
                    onChange={(event) => {
                      const nextEndTime = event.target.value;
                      const nextHours = calculateHoursBetween(formState.startTime, nextEndTime);

                      setFormState((current) => ({
                        ...current,
                        endTime: nextEndTime,
                        hours: nextHours > 0 && nextHours <= 12 ? nextHours : current.hours,
                      }));
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                    disabled={!formState.startTime}
                  >
                    <option value="">Select end time</option>
                    {endTimeSlots
                      .filter((timeSlot) => {
                        if (!formState.startTime) {
                          return true;
                        }

                        const hoursBetween = calculateHoursBetween(formState.startTime, timeSlot);
                        return hoursBetween >= 1 && hoursBetween <= 12;
                      })
                      .map((timeSlot) => (
                        <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Hours</label>
                  <select
                    value={formState.hours}
                    onChange={(event) => {
                      const nextHours = Number(event.target.value);
                      const nextEndTime = calculateEndTime(formState.startTime, nextHours);

                      setFormState((current) => ({
                        ...current,
                        hours: nextHours,
                        endTime: endTimeSlots.includes(nextEndTime) ? nextEndTime : current.endTime,
                      }));
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  >
                    {hourOptions.map((hourOption) => (
                      <option key={hourOption} value={hourOption}>{hourOption} hour{hourOption > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Amount</label>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-green-700">
                    {bookingPriceQuote.amount !== null ? `RWF ${bookingPriceQuote.amount.toLocaleString()}` : 'Contact sales'}
                  </div>
                  {bookingPriceQuote.amount === null && formState.hours > 2 && (
                    <p className="mt-2 text-xs text-blue-700">Bookings longer than 2 hours require sales pricing on {SALES_PHONE}.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Customer Name</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Payment Reference</label>
                <input
                  type="text"
                  value={formState.paymentReference}
                  onChange={(event) => setFormState((current) => ({ ...current, paymentReference: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  placeholder="Optional"
                />
              </div>

              {actionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Confirm Payment and Block Slot'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Calendar Bookings</h2>

            {loadingBookings ? (
              <p className="text-gray-600">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-600">No bookings saved yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-gray-900">{booking.date} from {booking.time} to {booking.endTime || calculateEndTime(booking.time, booking.duration)}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Duration: {booking.duration} hours</p>
                        {booking.name && <p className="text-sm text-gray-600">Customer: {booking.name}</p>}
                        {booking.paymentReference && <p className="text-sm text-gray-600">Payment ref: {booking.paymentReference}</p>}
                      </div>
                      <div className="flex gap-2">
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" /> Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}