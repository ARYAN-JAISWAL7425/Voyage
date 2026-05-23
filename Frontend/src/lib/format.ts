/** Format a number as Indian Rupees with lakh/crore grouping, e.g. ₹1,07,999. */
export function formatINR(value: number): string {
  return '₹' + value.toLocaleString('en-IN')
}

/** Compact INR for big figures, e.g. ₹20.0 Cr, ₹1.4 L. */
export function formatINRCompact(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)} L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`
  return '₹' + value
}

/** Plain Indian-grouped number (no symbol). */
export function formatNumberIN(value: number): string {
  return value.toLocaleString('en-IN')
}
