/**
 * Money helpers. All LiveDrop prices are Indian Rupees (₹). Centralised here
 * so the en-IN grouping (₹2,49,999) is consistent across web and mobile.
 */

/** Format a rupee amount the Indian way, e.g. 249999 -> "₹2,49,999". */
export const formatINR = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

/**
 * Orders store money as integer paise to avoid floating-point drift. Use these
 * to convert at the boundary (cart prices are in whole rupees).
 */

/** Rupees -> integer paise. e.g. 2499 -> 249900. */
export const toPaise = (rupees: number): number => Math.round(rupees * 100);

/** Integer paise -> rupees. e.g. 249900 -> 2499. */
export const fromPaise = (paise: number): number => paise / 100;

/** Format an integer-paise amount as ₹, e.g. 249900 -> "₹2,499". */
export const formatPaise = (paise: number): string => formatINR(fromPaise(paise));
