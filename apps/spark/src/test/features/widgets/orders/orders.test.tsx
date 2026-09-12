import type { Ticker } from '@/connections/coinbase';
import { OrdersWidget } from '@/features/widgets/orders/orders';
import { toggleEditMode } from '@/store/layoutSlice';
import { addOrder } from '@/store/ordersSlice';
import { createAppStore } from '@/store/store';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const ticker: Ticker = {
  productId: 'ETH-USD',
  bid: 2500,
  ask: 2510,
  bidSize: 0.5,
  askSize: 1.25,
  price: 2505,
  lastSize: 0.01,
  side: 'buy',
  tradeId: 1,
  time: '2026-09-12T13:45:12.345Z',
  receivedAt: 0,
  open24h: 2400,
  high24h: 2600,
  low24h: 2300,
  volume24h: 1000,
  volume30d: 30000,
};

vi.mock('@/connections/coinbase', () => ({
  COINBASE_PROVIDER: 'Coinbase',
  coinbaseFeed: {
    subscribe: () => () => undefined,
    getTicker: () => ticker,
    setUpdateInterval: () => undefined,
    setStreaming: () => undefined,
    setFocus: () => undefined,
  },
}));

const renderOrders = () => {
  const store = createAppStore();
  const Bound = () => {
    const widget = store.getState().widgets.items.find((item) => item.type === 'orders')!;
    if (widget.type !== 'orders') throw new Error('expected an orders widget');
    return <OrdersWidget widget={widget} />;
  };
  render(
    <Provider store={store}>
      <Bound />
    </Provider>,
  );
  return store;
};

const rowCells = () =>
  screen.getAllByTestId('order-row').map((row) =>
    Array.from(row.children)
      .filter((cell) => cell.getAttribute('data-testid') !== 'freshness-glow')
      .map((cell) => cell.textContent),
  );

const rowGlows = () =>
  screen
    .getAllByTestId('order-row')
    .map((row) => row.querySelector('[data-testid="freshness-glow"]') !== null);

describe('OrdersWidget', () => {
  it('has a header and a row per stored order, newest first', () => {
    const store = renderOrders();
    const seeded = store.getState().orders.items;
    expect(screen.getByText('Orders')).toBeInTheDocument();
    for (const heading of ['Instrument', 'Status', 'Price', 'Fulfilment', 'Submission Time', 'Actions']) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
    const rows = rowCells();
    expect(rows).toHaveLength(seeded.length);
    expect(rows[0][0]).toBe(seeded.at(-1)!.productId);
    expect(rows).toContainEqual([
      'ETH-USD',
      'Sellfulfilling37.50%',
      'limit2,540.00',
      'Coinbase0.75 / 2',
      expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/),
      '',
    ]);
  });

  it('adds placed orders on top as pending with nothing filled', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 10, 30, 0));
    const store = renderOrders();
    const draft = {
      productId: 'BTC-USD',
      side: 'buy',
      type: 'market',
      timeInForce: 'GTC',
      price: 100.5,
      size: 2,
      provider: 'Coinbase',
    } as const;
    act(() => {
      store.dispatch(addOrder(draft));
      store.dispatch(addOrder({ ...draft, productId: 'ETH-USD', side: 'sell', size: 0.25 }));
    });

    const rows = rowCells();
    expect(rows).toHaveLength(store.getState().orders.items.length);
    expect(rows[0]).toEqual([
      'ETH-USD',
      'Sellpending0.00%',
      'market100.50',
      'Coinbase0 / 0.25',
      '12/09/2026, 10:30:00',
      '',
    ]);
    expect(rows[1]).toEqual([
      'BTC-USD',
      'Buypending0.00%',
      'market100.50',
      'Coinbase0 / 2',
      '12/09/2026, 10:30:00',
      '',
    ]);
    vi.useRealTimers();
  });

  it('flashes only the orders placed just now', () => {
    const store = renderOrders();
    expect(rowGlows()).not.toContain(true);
    act(() => {
      store.dispatch(
        addOrder({
          productId: 'BTC-USD',
          side: 'buy',
          type: 'market',
          timeInForce: 'GTC',
          price: 1,
          size: 1,
          provider: 'Coinbase',
        }),
      );
    });
    const glows = rowGlows();
    expect(glows[0]).toBe(true);
    expect(glows.slice(1)).not.toContain(true);
  });

  it('shows the filled share on a progress bar', () => {
    renderOrders();
    const bars = screen.getAllByRole('progressbar').map((bar) => bar.getAttribute('aria-valuenow'));
    expect(bars).toContain('38');
    expect(bars).toContain('0');
  });

  it('has copy, modify and cancel actions on every row, modify only while the order is open', () => {
    const store = renderOrders();
    const orders = store.getState().orders.items;
    for (const name of ['Copy order', 'Modify order', 'Cancel order']) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(orders.length);
    }
    const open = orders.filter((order) => ['pending', 'fulfilling'].includes(order.status));
    const enabled = screen
      .getAllByRole('button', { name: 'Modify order' })
      .filter((button) => !(button as HTMLButtonElement).disabled);
    expect(enabled).toHaveLength(open.length);
    expect(open.length).toBeGreaterThan(0);
    expect(open.length).toBeLessThan(orders.length);
  });

  it('modifies an order in place, offering the unfilled size and keeping the fill', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const source = store.getState().orders.items.find((order) => order.productId === 'ETH-USD')!;
    expect(source).toMatchObject({ status: 'fulfilling', size: 2, filledSize: 0.75 });
    const row = screen.getAllByTestId('order-row').find((item) => item.textContent?.startsWith('ETH-USD'))!;
    await user.click(within(row).getByRole('button', { name: 'Modify order' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Modify Order');
    expect(within(dialog).getByRole('button', { name: 'SELL' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByRole('button', { name: 'SELL' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'BUY' })).toBeDisabled();
    expect(within(dialog).getByRole('textbox', { name: 'Size' })).toHaveValue('1.25');
    expect(within(dialog).getByRole('textbox', { name: 'Price' })).toHaveValue('2540');
    await user.clear(within(dialog).getByRole('textbox', { name: 'Size' }));
    await user.type(within(dialog).getByRole('textbox', { name: 'Size' }), '3');
    await user.clear(within(dialog).getByRole('textbox', { name: 'Price' }));
    await user.type(within(dialog).getByRole('textbox', { name: 'Price' }), '2600');
    await user.click(within(dialog).getByRole('radio', { name: 'IOC' }));

    const count = store.getState().orders.items.length;
    expect(rowGlows()).not.toContain(true);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getState().orders.items).toHaveLength(count);
    expect(store.getState().orders.items.find((order) => order.id === source.id)).toEqual({
      ...source,
      timeInForce: 'IOC',
      price: 2600,
      size: 3.75,
      updatedAt: expect.any(Number),
    });
    const glows = rowGlows();
    expect(glows.filter(Boolean)).toHaveLength(1);
    expect(glows[screen.getAllByTestId('order-row').indexOf(row)]).toBe(true);
  });

  it('copies an order into a new order form with the same values', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const source = store.getState().orders.items.find((order) => order.productId === 'ETH-USD')!;
    const row = screen.getAllByTestId('order-row').find((item) => item.textContent?.startsWith('ETH-USD'))!;
    await user.click(within(row).getByRole('button', { name: 'Copy order' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Place Order');
    expect(within(dialog).getByLabelText('ETH-USD details')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'SELL' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByRole('radio', { name: 'Limit' })).toBeChecked();
    expect(within(dialog).getByRole('radio', { name: 'GTC' })).toBeChecked();
    expect(within(dialog).getByRole('textbox', { name: 'Price' })).toHaveValue('2540');
    expect(within(dialog).getByRole('textbox', { name: 'Size' })).toHaveValue('2');
    expect(within(dialog).getByRole('textbox', { name: 'Provider' })).toHaveValue('Coinbase');

    const count = store.getState().orders.items.length;
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getState().orders.items).toHaveLength(count + 1);
    expect(store.getState().orders.items.at(-1)).toEqual(
      expect.objectContaining({
        productId: source.productId,
        side: source.side,
        type: source.type,
        timeInForce: source.timeInForce,
        price: source.price,
        size: source.size,
        provider: source.provider,
        filledSize: 0,
        status: 'pending',
      }),
    );
  });

  it('offers delete but no modify in edit mode', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    act(() => store.dispatch(toggleEditMode()));
    expect(await screen.findByRole('button', { name: 'Delete widget' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modify widget' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete widget' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(store.getState().widgets.items.some((widget) => widget.type === 'orders')).toBe(false);
  });
});
