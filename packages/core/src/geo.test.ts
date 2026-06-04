import { describe, it, expect } from 'vitest';
import { haversineKm, nearestStore } from './geo';

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm({ lat: 28.61, lng: 77.2 }, { lat: 28.61, lng: 77.2 })).toBe(0);
  });

  it('is ~111 km per degree of latitude at the equator', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });

  it('approximates Delhi -> Mumbai (~1150 km)', () => {
    const delhi = { lat: 28.61, lng: 77.21 };
    const mumbai = { lat: 19.08, lng: 72.88 };
    expect(haversineKm(delhi, mumbai)).toBeGreaterThan(1100);
    expect(haversineKm(delhi, mumbai)).toBeLessThan(1200);
  });
});

describe('nearestStore', () => {
  it('returns null for no stores', () => {
    expect(nearestStore([], { lat: 0, lng: 0 })).toBeNull();
  });

  it('picks the closest store', () => {
    const stores = [
      { id: 'far', lat: 19.08, lng: 72.88 },
      { id: 'near', lat: 28.7, lng: 77.1 },
    ];
    expect(nearestStore(stores, { lat: 28.61, lng: 77.21 })?.id).toBe('near');
  });
});
