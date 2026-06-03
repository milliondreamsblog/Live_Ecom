import { useEffect, useState } from 'react';
import type { Delivery } from '@livedrop/core';

export interface UseDeliveryTrackingOptions {
  apiBase: string;
  orderId: string | null;
  /** Poll interval in ms (default 4000). */
  intervalMs?: number;
}

/**
 * Headless delivery tracking: polls the delivery endpoint and returns the
 * current (simulated) rider state. Shared by web and mobile trackers.
 */
export function useDeliveryTracking({ apiBase, orderId, intervalMs = 4000 }: UseDeliveryTrackingOptions) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    if (!orderId) {
      setDelivery(null);
      return;
    }
    let active = true;

    const poll = () => {
      fetch(`${apiBase}/api/deliveries/${orderId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
        .then((d: Delivery) => {
          if (active) setDelivery(d);
        })
        .catch(() => {});
    };

    poll();
    const timer = setInterval(poll, intervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [apiBase, orderId, intervalMs]);

  return { delivery };
}
