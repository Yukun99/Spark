import { apiFetch, describeApiError } from '@/connections/api';
import { useEffect, useState } from 'react';

export type UseOrderProductsResult = {
  /** Distinct instruments the user has ordered, sorted. */
  products: string[];
  loading: boolean;
  error: string | null;
};

export const useOrderProducts = (): UseOrderProductsResult => {
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<string[]>('/orders/products')
      .then((loaded) => {
        if (active) setProducts(loaded);
      })
      .catch((cause: unknown) => {
        if (active) setError(describeApiError(cause, 'Failed to load instruments'));
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
