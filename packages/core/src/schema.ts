import { z } from 'zod';

/**
 * Domain schemas for LiveDrop. Single source of truth shared by web, server
 * (eventually) and mobile. Types are inferred from these schemas — never
 * hand-written — so validation and types can't drift apart.
 *
 * Ported 1:1 from the original apps/web/src/types.ts so existing code keeps
 * working; richer commerce/delivery schemas land in later phases.
 */

export const RoleSchema = z.enum(['host', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

export const ReactionTypeSchema = z.enum(['heart', 'like', 'fire']);
export type ReactionType = z.infer<typeof ReactionTypeSchema>;

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  category: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const UserSchema = z.object({
  name: z.string(),
  role: RoleSchema,
});
export type User = z.infer<typeof UserSchema>;

export const FeaturedProductSchema = ProductSchema.extend({
  featuredAt: z.number(),
});
export type FeaturedProduct = z.infer<typeof FeaturedProductSchema>;

export const CartItemSchema = ProductSchema.extend({
  q: z.number(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  username: z.string(),
  message: z.string(),
  timestamp: z.number(),
  type: z.enum(['purchase', 'chat']).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const StreamSchema = z.object({
  id: z.string(),
  title: z.string(),
  hostName: z.string(),
  category: z.string(),
  isLive: z.boolean(),
  thumbnailUrl: z.string(),
  startedAt: z.number(),
  viewers: z.number(),
});
export type Stream = z.infer<typeof StreamSchema>;

export const ReactionSchema = z.object({
  id: z.number(),
  type: z.string(),
  left: z.number(),
});
export type Reaction = z.infer<typeof ReactionSchema>;

export const PollOptionSchema = z.object({
  text: z.string(),
  votes: z.number(),
});
export type PollOption = z.infer<typeof PollOptionSchema>;

export const PollDataSchema = z.object({
  question: z.string(),
  options: z.array(PollOptionSchema),
  isActive: z.boolean(),
});
export type PollData = z.infer<typeof PollDataSchema>;

export const CouponDataSchema = z.object({
  code: z.string(),
  discount: z.number(),
  expiresAt: z.number(),
});
export type CouponData = z.infer<typeof CouponDataSchema>;

/**
 * Legacy aliases kept so the original web imports (`St`, `Msg`) resolve
 * unchanged during the migration. Prefer Stream / Message in new code.
 */
export type St = Stream;
export type Msg = Message;
