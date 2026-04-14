// Pitch pricing configuration (in RWF)
export const PITCH_PRICING = {
  Standard: {
    description: '5-a-side pitch',
  },
  Premium: {
    description: 'Full-size pitch',
  },
  Championship: {
    description: 'Professional-grade pitch',
  },
} as const;

export const SALES_PHONE = '+250792887614';
export const ONLINE_BOOKING_DURATION_HOURS = 2;

const MONDAY_TO_THURSDAY_DAY_RATE = 50000;
const MONDAY_TO_THURSDAY_EVENING_RATE = 70000;
const FRIDAY_DAY_RATE = 60000;
const FRIDAY_EVENING_RATE = 80000;
const WEEKEND_RATE = 80000;
const EVENING_START_HOUR = 16;

export type BookingPricingOptions = {
  date?: string | Date;
  startTime?: string;
};

export type BookingPriceQuote = {
  amount: number | null;
  requiresSalesContact: boolean;
  salesPhone: string;
  rateLabel: string | null;
};

export type PitchType = keyof typeof PITCH_PRICING;

function parseBookingDate(date?: string | Date): Date | null {
  if (!date) {
    return null;
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function parseHour(startTime?: string): number | null {
  if (!startTime) {
    return null;
  }

  const [hourValue] = startTime.split(':');
  const hour = Number.parseInt(hourValue, 10);
  return Number.isNaN(hour) ? null : hour;
}

export function getTwoHourSlotRate(date: string | Date, startTime: string): number {
  const bookingDate = parseBookingDate(date);
  const hour = parseHour(startTime);

  if (!bookingDate || hour === null) {
    return MONDAY_TO_THURSDAY_DAY_RATE;
  }

  const dayOfWeek = bookingDate.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return WEEKEND_RATE;
  }

  if (dayOfWeek === 5) {
    return hour < EVENING_START_HOUR ? FRIDAY_DAY_RATE : FRIDAY_EVENING_RATE;
  }

  return hour < EVENING_START_HOUR ? MONDAY_TO_THURSDAY_DAY_RATE : MONDAY_TO_THURSDAY_EVENING_RATE;
}

export function getRateLabel(date: string | Date, startTime: string): string {
  const bookingDate = parseBookingDate(date);
  const hour = parseHour(startTime);

  if (!bookingDate || hour === null) {
    return 'Select a date and time';
  }

  const dayOfWeek = bookingDate.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'Weekend rate';
  }

  if (dayOfWeek === 5) {
    return hour < EVENING_START_HOUR ? 'Friday daytime rate' : 'Friday evening rate';
  }

  return hour < EVENING_START_HOUR ? 'Monday-Thursday daytime rate' : 'Monday-Thursday evening rate';
}

export function getBookingPriceQuote(
  pitchType: PitchType,
  duration: number,
  options: BookingPricingOptions = {}
): BookingPriceQuote {
  if (!PITCH_PRICING[pitchType] || duration <= 0) {
    return {
      amount: null,
      requiresSalesContact: false,
      salesPhone: SALES_PHONE,
      rateLabel: null,
    };
  }

  if (duration > ONLINE_BOOKING_DURATION_HOURS) {
    return {
      amount: null,
      requiresSalesContact: true,
      salesPhone: SALES_PHONE,
      rateLabel: null,
    };
  }

  if (!options.date || !options.startTime) {
    return {
      amount: null,
      requiresSalesContact: false,
      salesPhone: SALES_PHONE,
      rateLabel: null,
    };
  }

  const twoHourRate = getTwoHourSlotRate(options.date, options.startTime);

  return {
    amount: Math.round((twoHourRate / ONLINE_BOOKING_DURATION_HOURS) * duration),
    requiresSalesContact: false,
    salesPhone: SALES_PHONE,
    rateLabel: getRateLabel(options.date, options.startTime),
  };
}

export function calculateBookingPrice(
  pitchType: PitchType,
  duration: number,
  options: BookingPricingOptions = {}
): number {
  const quote = getBookingPriceQuote(pitchType, duration, options);
  return quote.amount ?? 0;
}

export function getPricePerHour(_pitchType: PitchType): number {
  return MONDAY_TO_THURSDAY_DAY_RATE / ONLINE_BOOKING_DURATION_HOURS;
}
