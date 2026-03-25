// Pitch pricing configuration (in RWF)
// Live pricing: 2h = 70,000 RWF (35,000 RWF per hour), minimum payment 300 RWF carried from temporary behavior.
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
    return 300; // Minimum payment fallback
  }

  const raw = pricing.base * duration;
  return Math.max(raw, 300); // enforce min 300 RWF
}

export function getPricePerHour(pitchType: PitchType): number {
  const pricing = PITCH_PRICING[pitchType];
  return pricing?.base || 0;
}
