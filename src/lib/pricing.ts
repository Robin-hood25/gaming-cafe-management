import { PriceSnapshot } from '@/types/cafe';

export interface BillingCalculation {
  actualMinutes: number;
  billableMinutes: number;
  hourlyRate: number;
  gamingCharge: number;
  calculationBreakdown: string;
}

/**
 * Calculates billable time and gaming charges based on pricing snapshot or rules.
 */
export function calculateGamingBilling(
  startAt: string | Date,
  endAt: string | Date,
  pricing: Partial<PriceSnapshot>
): BillingCalculation {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  
  const elapsedMinutes = Math.max(1, (end - start) / (1000 * 60));
  
  const hourlyRate = Number(pricing.hourly_rate ?? 120);
  const minDuration = Number(pricing.minimum_duration ?? 30);
  const interval = Number(pricing.billing_interval ?? 15);
  const roundingRule = pricing.rounding_rule ?? 'ceil';
  const minCharge = Number(pricing.minimum_session_charge ?? 0);

  let billableMinutes = elapsedMinutes;

  if (billableMinutes < minDuration) {
    billableMinutes = minDuration;
  } else {
    if (roundingRule === 'ceil') {
      billableMinutes = Math.ceil(billableMinutes / interval) * interval;
    } else if (roundingRule === 'floor') {
      billableMinutes = Math.max(minDuration, Math.floor(billableMinutes / interval) * interval);
    } else if (roundingRule === 'round') {
      billableMinutes = Math.max(minDuration, Math.round(billableMinutes / interval) * interval);
    }
  }

  let gamingCharge = Number(((hourlyRate * billableMinutes) / 60).toFixed(2));
  if (minCharge > 0 && gamingCharge < minCharge) {
    gamingCharge = minCharge;
  }

  const calculationBreakdown = `${billableMinutes} mins @ ₹${hourlyRate}/hr (${roundingRule} rounding to ${interval}m intervals, min ${minDuration}m)`;

  return {
    actualMinutes: Math.round(elapsedMinutes),
    billableMinutes,
    hourlyRate,
    gamingCharge,
    calculationBreakdown,
  };
}

export function calculateExtensionCharge(additionalMinutes: number, hourlyRate: number): number {
  if (additionalMinutes <= 0) return 0;
  return Number(((hourlyRate * additionalMinutes) / 60).toFixed(2));
}

