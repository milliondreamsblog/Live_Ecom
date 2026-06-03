/**
 * Money helpers. All LiveDrop prices are Indian Rupees (₹). Centralised here
 * so the en-IN grouping (₹2,49,999) is consistent across web and mobile.
 */

/** Format a rupee amount the Indian way, e.g. 249999 -> "₹2,49,999". */
export const formatINR = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;
