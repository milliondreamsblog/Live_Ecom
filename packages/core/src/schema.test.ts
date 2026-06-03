import { describe, it, expect } from 'vitest';
import {
  ProductSchema,
  StreamSchema,
  PollDataSchema,
  CouponDataSchema,
  ReactionTypeSchema,
} from './schema';

describe('domain schema parsing', () => {
  it('accepts a valid product and rejects a bad one', () => {
    expect(
      ProductSchema.safeParse({ id: 1, name: 'Saree', price: 2499, image: 'x.jpg' }).success,
    ).toBe(true);
    // price must be a number
    expect(
      ProductSchema.safeParse({ id: 1, name: 'Saree', price: '2499', image: 'x.jpg' }).success,
    ).toBe(false);
  });

  it('validates a stream', () => {
    const ok = StreamSchema.safeParse({
      id: 'room1',
      title: 'Sale',
      hostName: 'Akshat',
      category: 'Fashion',
      isLive: true,
      thumbnailUrl: 't.jpg',
      startedAt: 1,
      viewers: 0,
    });
    expect(ok.success).toBe(true);
  });

  it('validates poll + coupon shapes', () => {
    expect(
      PollDataSchema.safeParse({
        question: 'Which?',
        options: [{ text: 'A', votes: 0 }],
        isActive: true,
      }).success,
    ).toBe(true);
    expect(
      CouponDataSchema.safeParse({ code: 'DIWALI', discount: 20, expiresAt: 123 }).success,
    ).toBe(true);
  });

  it('constrains reaction types to the known set', () => {
    expect(ReactionTypeSchema.safeParse('heart').success).toBe(true);
    expect(ReactionTypeSchema.safeParse('confetti').success).toBe(false);
  });
});
