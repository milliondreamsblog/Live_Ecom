import { useState, useEffect } from 'react';
import { useSocket } from '@livedrop/realtime';
import type { FeaturedProduct, Product } from '@livedrop/core';

/** Listens for the host pinning a product on the stream. */
export const useFeaturedProduct = (roomId: string) => {
  const { socket } = useSocket();
  const [featured, setFeatured] = useState<FeaturedProduct | null>(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handle = (product: Product) => {
      setFeatured({ ...product, featuredAt: Date.now() });
    };

    socket.on('featured-product', handle);
    return () => {
      socket.off('featured-product', handle);
    };
  }, [socket, roomId]);

  const dismiss = () => setFeatured(null);

  return { featured, dismiss };
};
