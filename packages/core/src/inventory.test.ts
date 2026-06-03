import { describe, it, expect } from 'vitest';
import { canFulfill } from './inventory';

describe('inventory canFulfill', () => {
  it('fulfills when stock covers the quantity', () => {
    expect(canFulfill(5, 3)).toBe(true);
    expect(canFulfill(3, 3)).toBe(true);
  });

  it('rejects when short on stock', () => {
    expect(canFulfill(2, 3)).toBe(false);
    expect(canFulfill(0, 1)).toBe(false);
  });

  it('rejects non-positive quantities', () => {
    expect(canFulfill(5, 0)).toBe(false);
    expect(canFulfill(5, -1)).toBe(false);
  });
});
