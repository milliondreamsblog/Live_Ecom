import { z } from 'zod';

/**
 * Hyperlocal inventory — stock is held per dark store so the app can promise
 * fast delivery only where the item is actually available. Minimal for now;
 * reservation/locking lands with the Redis work (plan.md §8).
 */

export const DarkStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type DarkStore = z.infer<typeof DarkStoreSchema>;

export const InventoryItemSchema = z.object({
  productId: z.number(),
  darkStoreId: z.string(),
  /** Units on hand and available to sell. */
  available: z.number().int().nonnegative(),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

/** Whether `quantity` of a product can be fulfilled from a stock level. */
export const canFulfill = (available: number, quantity: number): boolean =>
  quantity > 0 && available >= quantity;
