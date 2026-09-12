import { getCoinbaseProducts, type CoinbaseProduct } from '@/connections/coinbase';
import { useEffect, useState } from 'react';

export type UseCoinbaseProductsResult = {
  products: CoinbaseProduct[];
  loading: boolean;
  error: string | null;
};

export const useCoinbaseProducts = (): UseCoinbaseProductsResult => {
  const [products, setProducts] = useState<CoinbaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCoinbaseProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Failed to load products');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
};
