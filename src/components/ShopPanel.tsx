import React from 'react';
import { ProductCard } from './ProductCard';
import { prods } from '../services/mockData';

export const ShopPanel: React.FC = () => {
    return (
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {prods.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
};
