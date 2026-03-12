export type DurationTier = "1-5" | "5-15" | "15+";
export type Currency = "INR" | "USD";

export const PRICING: Record<DurationTier, Record<Currency, number>> = {
  "1-5": { INR: 19, USD: 1 },
  "5-15": { INR: 49, USD: 2 },
  "15+": { INR: 99, USD: 5 },
};

export const DURATION_LABELS: Record<DurationTier, string> = {
  "1-5": "1–5 min",
  "5-15": "5–15 min",
  "15+": "15+ min",
};

export function formatPrice(amount: number, currency: Currency): string {
  return currency === "INR" ? `₹${amount}` : `$${amount}`;
}
