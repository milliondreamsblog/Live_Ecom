import { describe, it, expect } from 'vitest';
import { formatINR, toPaise, fromPaise, formatPaise } from './money';

describe('money', () => {
  it('formats rupees with en-IN grouping', () => {
    expect(formatINR(2499)).toBe('₹2,499');
    expect(formatINR(249999)).toBe('₹2,49,999');
    expect(formatINR(0)).toBe('₹0');
  });

  it('converts rupees to integer paise', () => {
    expect(toPaise(2499)).toBe(249900);
    expect(toPaise(0.5)).toBe(50);
    expect(toPaise(0)).toBe(0);
  });

  it('converts paise back to rupees', () => {
    expect(fromPaise(249900)).toBe(2499);
    expect(fromPaise(50)).toBe(0.5);
  });

  it('round-trips without drift', () => {
    expect(fromPaise(toPaise(1299))).toBe(1299);
  });

  it('formats a paise amount as rupees', () => {
    expect(formatPaise(249900)).toBe('₹2,499');
  });
});
