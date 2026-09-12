import type { Ticker } from '@/connections/coinbase';
import { useLiveTicker } from '@/connections/hooks/useLiveTicker';
import { act, renderHook } from '@testing-library/react';

const tickers: Record<string, Partial<Ticker>> = {
  'BTC-USD': { bid: 1, ask: 2 },
  'ETH-USD': { bid: 3, ask: 4 },
};
const listeners: Record<string, Set<() => void>> = {};

vi.mock('@/connections/coinbase', () => ({
  coinbaseFeed: {
    subscribe: (productId: string, listener: () => void) => {
      (listeners[productId] ??= new Set()).add(listener);
      return () => listeners[productId].delete(listener);
    },
    getTicker: (productId: string) => tickers[productId],
  },
}));

const notify = (productId: string) => act(() => listeners[productId]?.forEach((l) => l()));

describe('useLiveTicker', () => {
  it('applies the snapshot on mount, on every notification, and stops after unmount', () => {
    const onTick = vi.fn();
    const { unmount } = renderHook(() => useLiveTicker('BTC-USD', onTick));
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenLastCalledWith(tickers['BTC-USD']);

    tickers['BTC-USD'] = { bid: 5, ask: 6 };
    notify('BTC-USD');
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenLastCalledWith({ bid: 5, ask: 6 });

    unmount();
    expect(listeners['BTC-USD'].size).toBe(0);
    notify('BTC-USD');
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('moves its subscription when the product changes', () => {
    const onTick = vi.fn();
    const { rerender } = renderHook(({ productId }) => useLiveTicker(productId, onTick), {
      initialProps: { productId: 'BTC-USD' },
    });
    rerender({ productId: 'ETH-USD' });
    expect(listeners['BTC-USD'].size).toBe(0);
    expect(listeners['ETH-USD'].size).toBe(1);
    expect(onTick).toHaveBeenLastCalledWith(tickers['ETH-USD']);
  });
});
