import React from 'react';
import { Bike, CheckCircle2, X } from 'lucide-react';
import { useDeliveryTracking } from '../hooks/useDeliveryTracking';
import type { DeliveryStatus } from '../types';
import { SOCKET_URL } from '../config';

// Local UI labels (importing the value from core would pull its zod module
// into the web bundle; the type import below is erased at build time).
const STEPS: DeliveryStatus[] = ['assigned', 'picked_up', 'en_route', 'delivered'];
const STEP_LABEL: Record<DeliveryStatus, string> = {
    assigned: 'Packed',
    picked_up: 'Picked up',
    en_route: 'On the way',
    delivered: 'Delivered',
};

/**
 * Live order tracker — polls the (simulated) rider and shows status + ETA.
 * Appears after checkout; the "10-minute" promise made visible.
 */
export const OrderTracker: React.FC<{ orderId: string | null; onClose?: () => void }> = ({ orderId, onClose }) => {
  const { delivery } = useDeliveryTracking({ apiBase: SOCKET_URL, orderId });

  if (!orderId || !delivery) return null;

  const activeIdx = STEPS.indexOf(delivery.status);
  const delivered = delivery.status === 'delivered';

  return (
    <div className="absolute bottom-24 left-4 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
          <Bike size={14} /> {delivered ? 'Delivered 🎉' : `Arriving in ${delivery.etaMinutes} min`}
        </span>
        {onClose && (
          <button type="button" title="Dismiss" onClick={onClose} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${i <= activeIdx ? 'bg-green-500' : 'bg-gray-200'}`}
                />
                <span className="text-[9px] text-gray-500 mt-1 w-14 text-center leading-tight">
                  {STEP_LABEL[step]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < activeIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-600 flex items-center gap-1.5">
          {delivered ? <CheckCircle2 size={14} className="text-green-500" /> : <Bike size={14} className="text-purple-500" />}
          Rider <span className="font-semibold text-gray-900">{delivery.riderName}</span>
        </p>
      </div>
    </div>
  );
};
