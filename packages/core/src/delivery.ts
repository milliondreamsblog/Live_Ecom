import { z } from 'zod';

/**
 * Delivery domain — the "10-minute" promise. A delivery is created when an
 * order is paid and progresses assigned -> picked_up -> en_route -> delivered.
 * Shared by server (simulated rider), web and mobile tracking UIs.
 */

export const DeliveryStatusSchema = z.enum([
  'assigned', // rider assigned at the dark store
  'picked_up', // order collected
  'en_route', // on the way to the buyer
  'delivered', // handed over
]);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

export const DeliverySchema = z.object({
  orderId: z.string(),
  riderName: z.string(),
  status: DeliveryStatusSchema,
  /** Minutes until arrival (0 once delivered). */
  etaMinutes: z.number(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  createdAt: z.number(),
});
export type Delivery = z.infer<typeof DeliverySchema>;

/** Allowed delivery transitions (linear, no cancel once out the door). */
export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  assigned: ['picked_up'],
  picked_up: ['en_route'],
  en_route: ['delivered'],
  delivered: [],
};

export const canTransitionDelivery = (from: DeliveryStatus, to: DeliveryStatus): boolean =>
  DELIVERY_TRANSITIONS[from].includes(to);

/** Human label for a status, for UI progress trackers. */
export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  assigned: 'Packed',
  picked_up: 'Picked up',
  en_route: 'On the way',
  delivered: 'Delivered',
};
