import type { Ticker } from '@/connections/coinbase';
import type {
  EditTarget,
  OrderTemplate,
} from '@/features/widgets/instrument/dialog/hooks/usePlaceOrderDialog';
import { PlaceOrderDialog } from '@/features/widgets/instrument/dialog/placeOrderDialog';
import type { Order } from '@/store/ordersSlice';
import { createAppStore } from '@/store/store';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const ticker: Ticker = {
  productId: 'BTC-USD',
  bid: 100.5,
  ask: 101,
  bidSize: 0.5,
  askSize: 1.25,
  price: 100.7,
  lastSize: 0.01,
  side: 'buy',
  tradeId: 1,
  time: '2026-09-12T13:45:12.345Z',
  receivedAt: 0,
  open24h: 90,
  high24h: 110,
  low24h: 80,
  volume24h: 1000,
  volume30d: 30000,
};

let current = ticker;
let notify: (() => void) | undefined;
const setFocus = vi.fn();

vi.mock('@/connections/coinbase', () => ({
  COINBASE_PROVIDER: 'Coinbase',
  coinbaseFeed: {
    subscribe: (_: string, listener: () => void) => {
      notify = listener;
      return () => undefined;
    },
    getTicker: () => current,
    setUpdateInterval: () => undefined,
    setStreaming: () => undefined,
    setFocus: (productId: string | null) => setFocus(productId),
  },
}));

/** Pushes a new tick through the mocked feed, as the interval notifier would. */
const tick = (next: Partial<Ticker>) => {
  current = { ...current, ...next };
  act(() => notify?.());
};

const renderDialog = (
  side: 'buy' | 'sell' = 'buy',
  template?: OrderTemplate,
  editing?: (orders: Order[]) => EditTarget,
) => {
  const store = createAppStore();
  const onClose = vi.fn();
  const { unmount } = render(
    <Provider store={store}>
      <PlaceOrderDialog
        productId='BTC-USD'
        side={side}
        template={template}
        editing={editing?.(store.getState().orders.items)}
        onClose={onClose}
      />
    </Provider>,
  );
  return { store, onClose, unmount };
};

const field = (name: string) => screen.getByRole('textbox', { name });
const confirmButton = () => screen.getByRole('button', { name: 'Confirm' });

describe('PlaceOrderDialog', () => {
  beforeEach(() => {
    current = ticker;
    setFocus.mockClear();
  });

  it('focuses the feed on the product while open and follows live prices for market orders', async () => {
    const user = userEvent.setup();
    const { unmount } = renderDialog('buy');
    expect(setFocus).toHaveBeenLastCalledWith('BTC-USD');

    tick({ ask: 102.5, bid: 101.5 });
    expect(field('Price')).toHaveValue('102.5');
    await user.type(field('Size'), '2');
    expect(screen.getByText('Estimated Order Value: 205.00')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Limit' }));
    tick({ ask: 103 });
    expect(field('Price')).toHaveValue('102.5');

    unmount();
    expect(setFocus).toHaveBeenLastCalledWith(null);
  });

  it('seeds the price from the side of the book and re-seeds when the side toggles', async () => {
    const user = userEvent.setup();
    renderDialog('buy');
    expect(screen.getByRole('dialog')).toHaveTextContent('Place Order');
    expect(screen.getByRole('button', { name: 'BUY' })).toHaveAttribute('aria-pressed', 'true');
    expect(field('Price')).toHaveValue('101');
    expect(field('Price')).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: 'Instrument' })).not.toBeInTheDocument();
    expect(field('Provider')).toHaveValue('Coinbase');

    const details = screen.getByLabelText('BTC-USD details');
    expect(details).toHaveTextContent('BTC-USD');
    expect(details).toHaveTextContent('Bid Size0.5');
    expect(details).toHaveTextContent('24H Volume1,000');
    tick({ bidSize: 0.75 });
    expect(details).toHaveTextContent('Bid Size0.75');

    await user.click(screen.getByRole('button', { name: 'SELL' }));
    expect(screen.getByRole('button', { name: 'SELL' })).toHaveAttribute('aria-pressed', 'true');
    expect(field('Price')).toHaveValue('100.5');
  });

  it('keeps Confirm disabled until price and size are valid, showing errors once edited', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(confirmButton()).toBeDisabled();
    expect(screen.getByText('Estimated Order Value: --')).toBeInTheDocument();

    await user.type(field('Size'), '0');
    expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.clear(field('Size'));
    await user.type(field('Size'), '2');
    expect(screen.getByText('Estimated Order Value: 202.00')).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();

    await user.click(screen.getByRole('radio', { name: 'Limit' }));
    expect(field('Price')).toBeEnabled();
    await user.clear(field('Price'));
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
    await user.type(field('Price'), '0.123456789');
    expect(screen.getByText('At most 8 decimal places')).toBeInTheDocument();
  });

  it('prefills from a template, keeping market prices live and limit prices as given', async () => {
    const user = userEvent.setup();
    const { unmount } = renderDialog('sell', { type: 'market', timeInForce: 'IOC', price: 99, size: 3 });
    expect(screen.getByRole('radio', { name: 'Market' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'IOC' })).toBeChecked();
    expect(field('Price')).toHaveValue('100.5');
    expect(field('Size')).toHaveValue('3');
    expect(screen.getByText('Estimated Order Value: 301.50')).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
    unmount();

    renderDialog('buy', { type: 'limit', timeInForce: 'FOK', price: 99, size: 0.5 });
    expect(screen.getByRole('radio', { name: 'Limit' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'FOK' })).toBeChecked();
    expect(field('Price')).toHaveValue('99');
    expect(field('Size')).toHaveValue('0.5');
    await user.click(screen.getByRole('radio', { name: 'Market' }));
    expect(field('Price')).toHaveValue('101');
  });

  it('saves edits onto the target order, adding the filled size back on top', async () => {
    const user = userEvent.setup();
    const target = (orders: Order[]) => orders.find((order) => order.status === 'fulfilling')!;
    const { store, onClose } = renderDialog('buy', { type: 'limit', timeInForce: 'GTC', price: 99, size: 1.25 }, target);
    const before = target(store.getState().orders.items);
    const count = store.getState().orders.items.length;
    expect(screen.getByRole('dialog')).toHaveTextContent('Modify Order');
    expect(screen.getByRole('button', { name: 'BUY' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'SELL' })).toBeDisabled();
    await user.clear(field('Size'));
    await user.type(field('Size'), '2');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().orders.items).toHaveLength(count);
    expect(store.getState().orders.items.find((order) => order.id === before.id)).toEqual({
      ...before,
      type: 'limit',
      timeInForce: 'GTC',
      price: 99,
      size: 2 + before.filledSize,
      updatedAt: expect.any(Number),
    });
  });

  it('stores the order on confirm and closes; cancel stores nothing', async () => {
    const user = userEvent.setup();
    const { store, onClose } = renderDialog('sell');
    const seeded = store.getState().orders.items.length;
    await user.type(field('Size'), '0.25');
    await user.click(screen.getByRole('radio', { name: 'IOC' }));
    await user.click(confirmButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().orders.items).toHaveLength(seeded + 1);
    expect(store.getState().orders.items.at(-1)).toEqual(
      expect.objectContaining({
        productId: 'BTC-USD',
        side: 'sell',
        type: 'market',
        timeInForce: 'IOC',
        price: 100.5,
        size: 0.25,
        provider: 'Coinbase',
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(store.getState().orders.items).toHaveLength(seeded + 1);
  });
});
