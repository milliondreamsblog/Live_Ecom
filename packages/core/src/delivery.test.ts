import { describe, it, expect } from 'vitest';
import { canTransitionDelivery, DELIVERY_STATUS_LABEL, DELIVERY_TRANSITIONS } from './delivery';

describe('delivery state machine', () => {
  it('progresses linearly', () => {
    expect(canTransitionDelivery('assigned', 'picked_up')).toBe(true);
    expect(canTransitionDelivery('picked_up', 'en_route')).toBe(true);
    expect(canTransitionDelivery('en_route', 'delivered')).toBe(true);
  });

  it('rejects skips and reversals', () => {
    expect(canTransitionDelivery('assigned', 'delivered')).toBe(false);
    expect(canTransitionDelivery('delivered', 'en_route')).toBe(false);
  });

  it('is terminal once delivered', () => {
    expect(DELIVERY_TRANSITIONS.delivered).toEqual([]);
  });

  it('labels every status', () => {
    expect(DELIVERY_STATUS_LABEL.assigned).toBe('Packed');
    expect(DELIVERY_STATUS_LABEL.en_route).toBe('On the way');
    expect(DELIVERY_STATUS_LABEL.delivered).toBe('Delivered');
  });
});
