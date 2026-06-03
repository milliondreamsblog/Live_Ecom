import { useState } from 'react';

export type CheckoutStatus = 'idle' | 'placing' | 'paid' | 'error';

/** A line item to order: cart price stays in whole rupees, server converts. */
export interface CheckoutLine {
  productId: number;
  name: string;
  priceRupees: number;
  quantity: number;
}

export interface UseCheckoutOptions {
  /** Backend base URL (same origin as the socket server). */
  apiBase: string;
  roomId?: string;
  username?: string;
}

/**
 * Headless checkout: creates a real order then pays it. Payment is mock-captured
 * server-side unless Razorpay is configured. Platform-agnostic — web and mobile
 * share it. Returns the order id on success, null on failure.
 */
export function useCheckout({ apiBase, roomId, username }: UseCheckoutOptions) {
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  const checkout = async (lines: CheckoutLine[], idempotencyKey?: string): Promise<string | null> => {
    setStatus('placing');
    try {
      const createRes = await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, username, items: lines, idempotencyKey }),
      });
      if (!createRes.ok) throw new Error(`create order failed: ${createRes.status}`);
      const order = (await createRes.json()) as { id: string };
      setOrderId(order.id);

      const payRes = await fetch(`${apiBase}/api/orders/${order.id}/pay`, { method: 'POST' });
      if (!payRes.ok) throw new Error(`pay failed: ${payRes.status}`);

      setStatus('paid');
      return order.id;
    } catch {
      setStatus('error');
      return null;
    }
  };

  return { status, orderId, checkout };
}
