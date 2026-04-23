import { FormEvent, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { addWeeks, format, parseISO } from 'date-fns';
import { Lock, LogOut, Pencil, Plus, Save, Trash2, XCircle } from 'lucide-react';
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
  recurringSeriesId?: string;
  recurringEndDate?: string;
};

type WeeklyBlock = {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
};

type BookingEditState = {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  paymentReference: string;
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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultWeeklyBlocks: WeeklyBlock[] = [
  { dayOfWeek: 1, startHour: 19, endHour: 22 },
  { dayOfWeek: 2, startHour: 18, endHour: 20 },
  { dayOfWeek: 3, startHour: 7, endHour: 9 },
  { dayOfWeek: 3, startHour: 18, endHour: 22 },
  { dayOfWeek: 4, startHour: 17, endHour: 22 },
  { dayOfWeek: 5, startHour: 7, endHour: 9 },
  { dayOfWeek: 5, startHour: 15, endHour: 22 },
  { dayOfWeek: 6, startHour: 8, endHour: 12 },
  { dayOfWeek: 0, startHour: 7, endHour: 14 },
];

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
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<BookingEditState>({
    date: '',
    startTime: '',
    endTime: '',
    name: '',
    paymentReference: '',
    status: 'confirmed',
  });
  const [weeklyBlocks, setWeeklyBlocks] = useState<WeeklyBlock[]>(defaultWeeklyBlocks);
  const [blockDraft, setBlockDraft] = useState({ dayOfWeek: 5, startTime: '18:00', endTime: '20:00' });
  const [savingBlocks, setSavingBlocks] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
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
      void loadWeeklyBlocks();
    }
  }, [isAuthenticated]);

  const loadWeeklyBlocks = async () => {
    try {
      const settingsSnapshot = await getDoc(doc(db, 'settings', 'calendarBlocks'));
      const payload = settingsSnapshot.data()?.weeklyBlocks;

      if (!Array.isArray(payload)) {
        setWeeklyBlocks(defaultWeeklyBlocks);
        return;
      }

      const normalized = payload
        .map((entry) => ({
          dayOfWeek: Number(entry.dayOfWeek),
          startHour: Number(entry.startHour),
          endHour: Number(entry.endHour),
        }))
        .filter((entry) => (
          Number.isInteger(entry.dayOfWeek)
          && entry.dayOfWeek >= 0
          && entry.dayOfWeek <= 6
          && Number.isInteger(entry.startHour)
          && Number.isInteger(entry.endHour)
          && entry.startHour >= 0
          && entry.endHour <= 24
          && entry.endHour > entry.startHour
        ));

      setWeeklyBlocks(normalized.length > 0 ? normalized : defaultWeeklyBlocks);
    } catch (error) {
      console.error('Error loading weekly blocks:', error);
      setBlockMessage('Failed to load weekly blocked slots.');
    }
  };

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

    if (isRecurring) {
      if (!recurringEndDate) {
        setActionError('Recurring bookings require an end date.');
        return;
      }

      if (recurringEndDate < formState.date) {
        setActionError('Recurring end date must be on or after the start date.');
        return;
      }
    }

    setSaving(true);
    setActionError(null);

    try {
      const nowIso = new Date().toISOString();
      const recurringSeriesId = isRecurring
        ? `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        : undefined;

      const bookingDates: string[] = [];
      if (isRecurring && recurringEndDate) {
        let currentDate = parseISO(formState.date);
        const endDate = parseISO(recurringEndDate);

        while (currentDate <= endDate) {
          bookingDates.push(format(currentDate, 'yyyy-MM-dd'));
          currentDate = addWeeks(currentDate, 1);

          if (bookingDates.length > 80) {
            throw new Error('Too many recurring slots. Please shorten recurrence range.');
          }
        }
      } else {
        bookingDates.push(formState.date);
      }

      if (bookingDates.length === 0) {
        throw new Error('No booking dates generated.');
      }

      if (bookingDates.length === 1) {
        await addDoc(collection(db, 'bookings'), {
          date: bookingDates[0],
          time: formState.startTime,
          endTime: formState.endTime,
          duration: bookingHours,
          pitch: 'Standard',
          name: formState.name.trim() || 'Confirmed booking',
          phone: '',
          email: '',
          paymentReference: formState.paymentReference.trim() || '',
          status: 'confirmed',
          updatedAt: nowIso,
          ...(bookingPriceQuote.amount !== null ? { amount: bookingPriceQuote.amount } : {}),
        });
      } else {
        const batch = writeBatch(db);
        const bookingsCollection = collection(db, 'bookings');

        bookingDates.forEach((date) => {
          batch.set(doc(bookingsCollection), {
            date,
            time: formState.startTime,
            endTime: formState.endTime,
            duration: bookingHours,
            pitch: 'Standard',
            name: formState.name.trim() || 'Recurring booking',
            phone: '',
            email: '',
            paymentReference: formState.paymentReference.trim() || '',
            status: 'confirmed',
            recurringSeriesId,
            recurringEndDate,
            updatedAt: nowIso,
            ...(bookingPriceQuote.amount !== null ? { amount: bookingPriceQuote.amount } : {}),
          });
        });

        await batch.commit();
      }

      setFormState({
        date: '',
        startTime: '',
        endTime: '',
        hours: 2,
        name: '',
        paymentReference: '',
      });
      setIsRecurring(false);
      setRecurringEndDate('');

      await loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      setActionError('Failed to save booking.');
    } finally {
      setSaving(false);
    }
  };

  const startEditingBooking = (booking: BookingRecord) => {
    setEditingBookingId(booking.id);
    setEditState({
      date: booking.date,
      startTime: booking.time,
      endTime: booking.endTime || calculateEndTime(booking.time, booking.duration),
      name: booking.name || '',
      paymentReference: booking.paymentReference || '',
      status: booking.status,
    });
    setActionError(null);
  };

  const handleSaveBookingEdit = async (bookingId: string) => {
    if (!editState.date || !editState.startTime || !editState.endTime) {
      setActionError('Date, start time, and end time are required for editing.');
      return;
    }

    const nextDuration = calculateHoursBetween(editState.startTime, editState.endTime);
    if (nextDuration <= 0 || nextDuration > 12) {
      setActionError('Edited booking duration must be between 1 and 12 hours.');
      return;
    }

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        date: editState.date,
        time: editState.startTime,
        endTime: editState.endTime,
        duration: nextDuration,
        name: editState.name.trim() || 'Confirmed booking',
        paymentReference: editState.paymentReference.trim(),
        status: editState.status,
        updatedAt: new Date().toISOString(),
      });

      setEditingBookingId(null);
      await loadBookings();
    } catch (error) {
      console.error('Error editing booking:', error);
      setActionError('Failed to save booking changes.');
    }
  };

  const handleSaveWeeklyBlocks = async () => {
    if (weeklyBlocks.length === 0) {
      setBlockMessage('Add at least one weekly blocked slot before saving.');
      return;
    }

    setSavingBlocks(true);
    setBlockMessage(null);

    try {
      await setDoc(doc(db, 'settings', 'calendarBlocks'), {
        weeklyBlocks,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setBlockMessage('Weekly blocked slots saved.');
    } catch (error) {
      console.error('Error saving weekly blocks:', error);
      setBlockMessage('Failed to save weekly blocked slots.');
    } finally {
      setSavingBlocks(false);
    }
  };

  const handleAddWeeklyBlock = () => {
    const startHour = timeToHour(blockDraft.startTime);
    const endHour = timeToHour(blockDraft.endTime);

    if (endHour <= startHour) {
      setBlockMessage('Block end time must be after start time.');
      return;
    }

    setWeeklyBlocks((current) => ([
      ...current,
      {
        dayOfWeek: blockDraft.dayOfWeek,
        startHour,
        endHour,
      },
    ]));
    setBlockMessage(null);
  };

  const handleRemoveWeeklyBlock = (index: number) => {
    setWeeklyBlocks((current) => current.filter((_, currentIndex) => currentIndex !== index));
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

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(event) => {
                      setIsRecurring(event.target.checked);
                      if (!event.target.checked) {
                        setRecurringEndDate('');
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  Recurring weekly booking
                </label>
                <p className="mt-2 text-xs text-gray-600">Example: Every Friday at 18:00 until an end date.</p>
                {isRecurring && (
                  <div className="mt-3">
                    <label className="mb-2 block text-sm font-semibold text-gray-900">Recurring End Date</label>
                    <input
                      type="date"
                      min={formState.date || undefined}
                      value={recurringEndDate}
                      onChange={(event) => setRecurringEndDate(event.target.value)}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                    />
                  </div>
                )}
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
                {saving ? 'Saving...' : isRecurring ? 'Save Recurring Bookings' : 'Confirm Payment and Block Slot'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Weekly Blocked Slots</h2>
              <p className="mb-4 text-sm text-gray-600">These replace the old hardcoded blocked slots shown on the booking calendar.</p>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <select
                  value={blockDraft.dayOfWeek}
                  onChange={(event) => setBlockDraft((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))}
                  className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                >
                  {dayNames.map((dayName, index) => (
                    <option key={dayName} value={index}>{dayName}</option>
                  ))}
                </select>
                <select
                  value={blockDraft.startTime}
                  onChange={(event) => setBlockDraft((current) => ({ ...current, startTime: event.target.value }))}
                  className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                >
                  {timeSlots.map((timeSlot) => (
                    <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                  ))}
                </select>
                <select
                  value={blockDraft.endTime}
                  onChange={(event) => setBlockDraft((current) => ({ ...current, endTime: event.target.value }))}
                  className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                >
                  {endTimeSlots.map((timeSlot) => (
                    <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddWeeklyBlock}
                  className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  Add
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {weeklyBlocks.map((block, index) => (
                  <div key={`${block.dayOfWeek}-${block.startHour}-${block.endHour}-${index}`} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <span>{dayNames[block.dayOfWeek]} {hourToTime(block.startHour)} - {hourToTime(block.endHour)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWeeklyBlock(index)}
                      className="rounded-xl border border-red-200 px-3 py-1 font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {blockMessage && (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {blockMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveWeeklyBlocks}
                disabled={savingBlocks}
                className="mt-5 w-full rounded-2xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-black disabled:bg-gray-500"
              >
                {savingBlocks ? 'Saving...' : 'Save Weekly Blocked Slots'}
              </button>
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
                    {editingBookingId === booking.id ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input
                            type="date"
                            value={editState.date}
                            onChange={(event) => setEditState((current) => ({ ...current, date: event.target.value }))}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                          />
                          <select
                            value={editState.startTime}
                            onChange={(event) => {
                              const nextStartTime = event.target.value;
                              const nextEndTime = calculateEndTime(nextStartTime, calculateHoursBetween(editState.startTime, editState.endTime) || 2);
                              setEditState((current) => ({ ...current, startTime: nextStartTime, endTime: endTimeSlots.includes(nextEndTime) ? nextEndTime : current.endTime }));
                            }}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                          >
                            {timeSlots.map((timeSlot) => (
                              <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                            ))}
                          </select>
                          <select
                            value={editState.endTime}
                            onChange={(event) => setEditState((current) => ({ ...current, endTime: event.target.value }))}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                          >
                            {endTimeSlots
                              .filter((timeSlot) => calculateHoursBetween(editState.startTime, timeSlot) >= 1)
                              .map((timeSlot) => (
                                <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                              ))}
                          </select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <input
                            type="text"
                            value={editState.name}
                            onChange={(event) => setEditState((current) => ({ ...current, name: event.target.value }))}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                            placeholder="Customer name"
                          />
                          <input
                            type="text"
                            value={editState.paymentReference}
                            onChange={(event) => setEditState((current) => ({ ...current, paymentReference: event.target.value }))}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                            placeholder="Payment reference"
                          />
                          <select
                            value={editState.status}
                            onChange={(event) => setEditState((current) => ({ ...current, status: event.target.value as BookingEditState['status'] }))}
                            className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                          >
                            <option value="confirmed">confirmed</option>
                            <option value="pending">pending</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveBookingEdit(booking.id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBookingId(null)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Cancel Edit
                          </button>
                        </div>
                      </div>
                    ) : (
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
                          {booking.recurringSeriesId && <p className="text-xs text-gray-500">Recurring booking series</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingBooking(booking)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}