import { FormEvent, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { addWeeks, format, parseISO } from 'date-fns';
import { Download, Eye, Lock, LogOut, Pencil, Plus, Save, Trash2 } from 'lucide-react';
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
  teamName?: string;
  phone: string;
  email: string;
  paymentReference?: string;
  amount?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  recurringSeriesId?: string;
  recurringEndDate?: string;
};

type BookingEditState = {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  teamName: string;
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

function getConfiguredAdminEmail(): string {
  return (import.meta.env.VITE_ADMIN_EMAIL || '').toString().trim().toLowerCase();
}

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

function getPermissionAwareErrorMessage(error: unknown, fallback: string): string {
  const errorCode = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  if (errorCode === 'permission-denied') {
    return 'Permission denied by Firestore rules. Ensure your admin account has write access to bookings.';
  }

  return fallback;
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
    teamName: '',
    paymentReference: '',
    status: 'confirmed',
  });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    date: '',
    startTime: '',
    endTime: '',
    hours: 2,
    name: '',
    teamName: '',
    paymentReference: '',
  });

  const bookingPriceQuote = getBookingPriceQuote('Standard', formState.hours, {
    date: formState.date,
    startTime: formState.startTime,
  });

  useEffect(() => {
    // Require explicit credentials each time the admin page is opened.
    void signOut(auth).catch((error) => {
      console.error('Error resetting admin session:', error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const adminEmail = getConfiguredAdminEmail();
      const signedInEmail = user?.email?.toLowerCase() || '';
      const isAdminSession = Boolean(user && adminEmail && signedInEmail === adminEmail);

      setCurrentUser(user);

      if (user && !isAdminSession) {
        void signOut(auth);
        setIsAuthenticated(false);
        setAuthError('This account is not authorized for admin access.');
      } else {
        setIsAuthenticated(isAdminSession);
      }

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
      setActionError(getPermissionAwareErrorMessage(error, 'Failed to load bookings.'));
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const adminEmail = getConfiguredAdminEmail();
    const normalizedIdentifier = loginIdentifier.trim();

    if (!adminEmail) {
      setAuthError('Admin email is not configured.');
      return;
    }

    const emailToUse = normalizedIdentifier.toLowerCase() === ADMIN_USERNAME
      ? adminEmail
      : normalizedIdentifier.toLowerCase();

    if (emailToUse !== adminEmail) {
      setAuthError('Only the configured admin account can log in here.');
      return;
    }

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
          teamName: formState.teamName.trim() || '',
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
            teamName: formState.teamName.trim() || '',
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
        teamName: '',
        paymentReference: '',
      });
      setIsRecurring(false);
      setRecurringEndDate('');

      await loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      setActionError(getPermissionAwareErrorMessage(error, 'Failed to save booking.'));
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
      teamName: booking.teamName || '',
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
        teamName: editState.teamName.trim(),
        paymentReference: editState.paymentReference.trim(),
        status: editState.status,
        updatedAt: new Date().toISOString(),
      });

      setEditingBookingId(null);
      await loadBookings();
    } catch (error) {
      console.error('Error editing booking:', error);
      setActionError(getPermissionAwareErrorMessage(error, 'Failed to save booking changes.'));
    }
  };

  const handleDownloadBookings = () => {
    const csvHeader = ['Date', 'Start Time', 'End Time', 'Duration', 'Customer Name', 'Team Name', 'Status', 'Payment Reference', 'Amount', 'Recurring Series'];
    const csvRows = bookings.map((booking) => [
      booking.date,
      booking.time,
      booking.endTime || calculateEndTime(booking.time, booking.duration),
      booking.duration.toString(),
      booking.name || '',
      booking.teamName || '',
      booking.status,
      booking.paymentReference || '',
      booking.amount?.toString() || '',
      booking.recurringSeriesId || '',
    ]);

    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvContent = [csvHeader, ...csvRows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(csvBlob);

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(downloadUrl);
  };

  const selectedBooking = selectedBookingId
    ? bookings.find((booking) => booking.id === selectedBookingId) || null
    : null;

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      await loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      setActionError(getPermissionAwareErrorMessage(error, 'Failed to delete booking.'));
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
              onClick={handleDownloadBookings}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> Download CSV
            </button>
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
                <label className="mb-2 block text-sm font-semibold text-gray-900">Team Name (Internal)</label>
                <input
                  type="text"
                  value={formState.teamName}
                  onChange={(event) => setFormState((current) => ({ ...current, teamName: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  placeholder="Optional"
                />
                <p className="mt-2 text-xs text-gray-500">Stored for admin records only and not shown on the public booking pages.</p>
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

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Calendar Bookings</h2>

            {actionError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {loadingBookings ? (
              <p className="text-gray-600">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-600">No bookings saved yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Team</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment Ref</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="align-top">
                        <td className="px-4 py-3 text-gray-800">{booking.date}</td>
                        <td className="px-4 py-3 text-gray-800">{booking.time} - {booking.endTime || calculateEndTime(booking.time, booking.duration)}</td>
                        <td className="px-4 py-3 text-gray-800">{booking.duration}h</td>
                        <td className="px-4 py-3 text-gray-800">{booking.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-800">{booking.teamName || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{booking.paymentReference || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingId(booking.id)}
                              aria-label="View booking"
                              title="View"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 text-gray-700 transition hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingBooking(booking)}
                              aria-label="Edit booking"
                              title="Edit"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 text-blue-700 transition hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(booking.id)}
                              aria-label="Delete booking"
                              title="Delete"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Edit Booking</h3>
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
                  value={editState.teamName}
                  onChange={(event) => setEditState((current) => ({ ...current, teamName: event.target.value }))}
                  className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  placeholder="Team name (internal)"
                />
                <input
                  type="text"
                  value={editState.paymentReference}
                  onChange={(event) => setEditState((current) => ({ ...current, paymentReference: event.target.value }))}
                  className="rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                  placeholder="Payment reference"
                />
              </div>
              <select
                value={editState.status}
                onChange={(event) => setEditState((current) => ({ ...current, status: event.target.value as BookingEditState['status'] }))}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-600 focus:outline-none"
              >
                <option value="confirmed">confirmed</option>
                <option value="pending">pending</option>
                <option value="cancelled">cancelled</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveBookingEdit(editingBookingId)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBookingId(null)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Booking Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Date:</span> {selectedBooking.date}</p>
              <p><span className="font-semibold text-gray-900">Time:</span> {selectedBooking.time} - {selectedBooking.endTime || calculateEndTime(selectedBooking.time, selectedBooking.duration)}</p>
              <p><span className="font-semibold text-gray-900">Duration:</span> {selectedBooking.duration} hours</p>
              <p><span className="font-semibold text-gray-900">Customer:</span> {selectedBooking.name || '-'}</p>
              <p><span className="font-semibold text-gray-900">Team:</span> {selectedBooking.teamName || '-'}</p>
              <p><span className="font-semibold text-gray-900">Status:</span> {selectedBooking.status}</p>
              <p><span className="font-semibold text-gray-900">Payment ref:</span> {selectedBooking.paymentReference || '-'}</p>
              <p><span className="font-semibold text-gray-900">Amount:</span> {selectedBooking.amount ? `RWF ${selectedBooking.amount.toLocaleString()}` : '-'}</p>
              <p><span className="font-semibold text-gray-900">Recurring:</span> {selectedBooking.recurringSeriesId ? 'Yes' : 'No'}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedBookingId(null)}
              className="mt-5 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}