import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { CouponData } from '../types';

interface CouponBannerProps {
    coupon: CouponData | null;
}

export const CouponBanner: React.FC<CouponBannerProps> = ({ coupon }) => {
    const [tLeft, setTLeft] = useState(0);

    useEffect(() => {
        if (!coupon) return;

        const calcTime = () => {
            const diff = coupon.expiresAt - Date.now();
            return Math.max(0, Math.ceil(diff / 1000));
        };

        const updateTimer = () => {
            const secs = calcTime();
            setTLeft(secs);
        };

        updateTimer();
        const int = setInterval(updateTimer, 1000);

        return () => clearInterval(int);
    }, [coupon]);

    if (!coupon || tLeft <= 0) return null;

    return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in pointer-events-none">
            <div className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow-lg border-2 border-yellow-200 flex items-center gap-4 pointer-events-auto">
                <div className="flex flex-col items-center leading-none">
                    <span className="text-xs font-bold uppercase tracking-wider">Flash Sale</span>
                    <span className="text-xl font-black">{coupon.code} (-{coupon.discount}%)</span>
                </div>
                <div className="h-8 w-px bg-black/20"></div>
                <div className="flex items-center gap-1 font-mono font-bold text-lg text-red-600">
                    <Timer size={20} />
                    <span>00:{tLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>
        </div>
    );
};
