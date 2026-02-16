import React from 'react';
import { SCard } from '../components/StreamCard';
import { sts } from '../services/mockData';
import { Flame, TrendingUp } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Discover Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Shopping</span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Watch real-time product demos, interact with hosts, and shop the latest trends instantly.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sts.map((s) => (
            <SCard key={s.id} s={s} />
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sts.slice(0, 4).map((s) => (
              <SCard key={`rec-${s.id}`} s={s} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};