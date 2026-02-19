import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { useC } from '../contexts/CartContext';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { add } = useC();

    return (
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-xs">In Stock</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    <button
                        onClick={() => add(product)}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
