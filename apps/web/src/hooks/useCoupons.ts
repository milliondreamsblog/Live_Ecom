import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { CouponData } from '../types';

export const useCoupons = (roomId: string) => {
    const { socket } = useSocket();
    const [coupon, setCoupon] = useState<CouponData | null>(null);

    useEffect(() => {
        if (!socket) return;

        const handleCoupon = (c: CouponData) => setCoupon(c);
        const handleExpired = () => setCoupon(null);

        socket.on('new-coupon', handleCoupon);
        socket.on('current-coupon', handleCoupon);
        socket.on('coupon-expired', handleExpired);

        return () => {
            socket.off('new-coupon', handleCoupon);
            socket.off('current-coupon', handleCoupon);
            socket.off('coupon-expired', handleExpired);
        };
    }, [socket, roomId]);

    const sendCoupon = (code: string, discount: number, duration: number) => {
        if (!socket) return;
        socket.emit('send-coupon', { roomId, code, discount, duration });
    };

    return { coupon, sendCoupon };
};
