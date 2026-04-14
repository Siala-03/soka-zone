// Pitch pricing configuration (in RWF)
// Current live pricing: 70,000 RWF for 2 hours.
export const PITCH_PRICING = {
  Standard: {
    base: 35000,
    description: '5-a-side pitch',
  },
  Premium: {
    base: 35000,
    description: 'Full-size pitch',
  },
  Championship: {
    base: 35000,
    description: 'Professional-grade pitch',
  },
} as const;

export type PitchType = keyof typeof PITCH_PRICING;

export function calculateBookingPrice(pitchType: PitchType, duration: number): number {
  const pricing = PITCH_PRICING[pitchType];
  if (!pricing || duration <= 0) {
    return 35000;
  }

  return pricing.base * duration;
}

export function getPricePerHour(pitchType: PitchType): number {
  const pricing = PITCH_PRICING[pitchType];
  return pricing?.base || 0;
}
