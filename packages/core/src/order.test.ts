import { describe, it, expect } from 'vitest';
import { canTransition, nextStatuses, orderTotalPaise, CreateOrderInputSchema } from './order';

describe('order state machine', () => {
  it('allows valid forward transitions', () => {
    expect(canTransition('pending', 'paid')).toBe(true);
    expect(canTransition('paid', 'packing')).toBe(true);
    expect(canTransition('packing', 'out_for_delivery')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
  });

  it('rejects skips and reversals', () => {
    expect(canTransition('pending', 'delivered')).toBe(false);
    expect(canTransition('paid', 'pending')).toBe(false);
    expect(canTransition('delivered', 'paid')).toBe(false);
  });

  it('allows cancellation before dispatch only', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true);
    expect(canTransition('packing', 'cancelled')).toBe(true);
    expect(canTransition('out_for_delivery', 'cancelled')).toBe(false);
  });

  it('treats delivered and cancelled as terminal', () => {
    expect(nextStatuses('delivered')).toEqual([]);
    expect(nextStatuses('cancelled')).toEqual([]);
  });
});

describe('orderTotalPaise', () => {
  it('sums unit price times quantity', () => {
    expect(
      orderTotalPaise([
        { unitPricePaise: 249900, quantity: 2 },
        { unitPricePaise: 79900, quantity: 1 },
      ]),
    ).toBe(579700);
  });

  it('is zero for an empty cart', () => {
    expect(orderTotalPaise([])).toBe(0);
  });
});

describe('CreateOrderInput validation', () => {
  it('accepts a valid payload', () => {
    const result = CreateOrderInputSchema.safeParse({
      items: [{ productId: 1, name: 'Saree', priceRupees: 2499, quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty carts and bad quantities', () => {
    expect(CreateOrderInputSchema.safeParse({ items: [] }).success).toBe(false);
    expect(
      CreateOrderInputSchema.safeParse({
        items: [{ productId: 1, name: 'x', priceRupees: 10, quantity: 0 }],
      }).success,
    ).toBe(false);
  });
});
