import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Zap } from 'lucide-react';
import { FeaturedProduct } from '../types';
import { useC } from '../contexts/CartContext';

interface FeaturedProductOverlayProps {
    product: FeaturedProduct | null;
    onDismiss: () => void;
}

export const FeaturedProductOverlay: React.FC<FeaturedProductOverlayProps> = ({ product, onDismiss }) => {
    const { add } = useC();
    const [visible, setVisible] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (product) {
            setVisible(true);
            setAdded(false);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onDismiss, 400);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [product]);

    const handleAdd = () => {
        if (!product) return;
        add(product);
        setAdded(true);
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(onDismiss, 400);
    };

    if (!product) return null;

    return (
        <div
            className={`absolute bottom-24 left-4 z-40 transition-all duration-400 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden border border-orange-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white">
                        <Zap size={14} className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wide">Host ka Favourite! ✨</span>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Product */}
                <div className="flex gap-3 p-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    />
                    <div className="flex-grow flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
                            {product.category && (
                                <p className="text-gray-400 text-xs mt-0.5">{product.category}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-extrabold text-gray-900">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <button
                                onClick={handleAdd}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    added
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                                <ShoppingCart size={13} />
                                {added ? 'Added! ✓' : 'Cart mein add karo'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-pink-500 animate-shrink-x"
                        style={{ animationDuration: '8s', animationTimingFunction: 'linear', animationFillMode: 'forwards' }}
                    />
                </div>
            </div>
        </div>
    );
};
