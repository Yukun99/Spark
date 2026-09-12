import { OrdersWidget } from '@/features/widgets/orders/orders';
import { toggleEditMode } from '@/store/layoutSlice';
import { addOrder } from '@/store/ordersSlice';
import { createAppStore } from '@/store/store';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

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

  it('has copy, modify and cancel actions on every row', () => {
    const store = renderOrders();
    const count = store.getState().orders.items.length;
    for (const name of ['Copy order', 'Modify order', 'Cancel order']) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(count);
    }
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
