import { useSocket } from '@livedrop/realtime';
import type { Product } from '@livedrop/core';

export interface StreamInfo {
  title: string;
  category: string;
  hostName: string;
}

/** Host-side stream controls (go live, end, feature product, coupons). */
export const useHostControls = (roomId: string) => {
  const { socket } = useSocket();

  const goLive = (info: StreamInfo) => {
    if (!socket) return;
    socket.emit('join-room', roomId);
    socket.emit('broadcaster', roomId);
    socket.emit('start-stream', { roomId, ...info });
  };

  const endStream = () => socket?.emit('end-stream', { roomId });

  const featureProduct = (product: Product) => socket?.emit('feature-product', { roomId, product });

  const sendCoupon = (code: string, discount: number, duration: number) =>
    socket?.emit('send-coupon', { roomId, code, discount, duration });

  return { goLive, endStream, featureProduct, sendCoupon };
};
