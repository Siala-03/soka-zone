// Pitch pricing configuration (in RWF)
// Temporary sandbox pricing: 2h = 300 RWF (150 RWF/hour), minimum payment 300 RWF.
export const PITCH_PRICING = {
  Standard: {
    base: 150, // Price per hour (temporary placeholder)
    description: '5-a-side pitch',
  },
  Premium: {
    base: 150, // Price per hour (temporary placeholder)
    description: 'Full-size pitch',
  },
  Championship: {
    base: 150, // Price per hour (temporary placeholder)
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
