import {
  ONLINE_BOOKING_DURATION_HOURS,
  SALES_PHONE,
  getBookingPriceQuote,
  getRateLabel,
  getTwoHourSlotRate,
} from './pricing';

describe('pricing utility', () => {
  it('uses the Monday to Thursday daytime rate', () => {
    expect(getTwoHourSlotRate('2026-04-13', '10:00')).toBe(50000);
    expect(getRateLabel('2026-04-13', '10:00')).toBe('Monday-Thursday daytime rate');
  });

  it('uses the Monday to Thursday evening rate', () => {
    expect(getTwoHourSlotRate('2026-04-16', '18:00')).toBe(70000);
    expect(getRateLabel('2026-04-16', '18:00')).toBe('Monday-Thursday evening rate');
  });

  it('uses the Friday daytime and evening rates', () => {
    expect(getTwoHourSlotRate('2026-04-17', '14:00')).toBe(60000);
    expect(getTwoHourSlotRate('2026-04-17', '18:00')).toBe(80000);
  });

  it('uses the weekend rate', () => {
    expect(getTwoHourSlotRate('2026-04-18', '09:00')).toBe(80000);
    expect(getRateLabel('2026-04-19', '17:00')).toBe('Weekend rate');
  });

  it('returns a quote for a standard online booking', () => {
    expect(
      getBookingPriceQuote('Standard', ONLINE_BOOKING_DURATION_HOURS, {
        date: '2026-04-14',
        startTime: '17:00',
      })
    ).toEqual({
      amount: 70000,
      requiresSalesContact: false,
      salesPhone: SALES_PHONE,
      rateLabel: 'Monday-Thursday evening rate',
    });
  });

  it('requires sales contact for bookings longer than 2 hours', () => {
    expect(
      getBookingPriceQuote('Standard', 3, {
        date: '2026-04-14',
        startTime: '10:00',
      })
    ).toEqual({
      amount: null,
      requiresSalesContact: true,
      salesPhone: SALES_PHONE,
      rateLabel: null,
    });
  });
});