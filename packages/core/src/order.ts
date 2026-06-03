import { z } from 'zod';

/**
 * Order domain — the durable, transactional side of LiveDrop. Amounts are
 * integer paise (see money.ts). Shared by server, web and mobile.
 */

export const OrderStatusSchema = z.enum([
  'pending', // created, awaiting payment
  'paid', // payment captured
  'packing', // dark store assembling
  'out_for_delivery', // rider en route
  'delivered', // done
  'cancelled', // aborted / payment failed / timed out
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  /** Unit price in integer paise. */
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  roomId: z.string().optional(),
  username: z.string().optional(),
  items: z.array(OrderItemSchema),
  /** Order total in integer paise. */
  amountPaise: z.number().int().nonnegative(),
  status: OrderStatusSchema,
  createdAt: z.number(),
});
export type Order = z.infer<typeof OrderSchema>;

/** Payload the client sends to create an order (cart prices are in rupees). */
export const CreateOrderInputSchema = z.object({
  roomId: z.string().optional(),
  username: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        name: z.string(),
        priceRupees: z.number().nonnegative(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  /** Dedupe key so retries don't double-charge. */
  idempotencyKey: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

/**
 * Allowed order-status transitions. The single source of truth for the order
 * lifecycle, enforced server-side and used by the UI to render progress.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['packing', 'cancelled'],
  packing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

/** Whether `to` is a legal next status from `from`. */
export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_TRANSITIONS[from].includes(to);

/** Statuses reachable from the given one. */
export const nextStatuses = (from: OrderStatus): OrderStatus[] => ORDER_TRANSITIONS[from];
