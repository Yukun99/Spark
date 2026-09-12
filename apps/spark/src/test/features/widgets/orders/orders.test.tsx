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
  screen
    .getAllByTestId('order-row')
    .map((row) => Array.from(row.children).map((cell) => cell.textContent));

describe('OrdersWidget', () => {
  it('has a header and a row per stored order, newest first', () => {
    const store = renderOrders();
    const seeded = store.getState().orders.items;
    expect(screen.getByText('Orders')).toBeInTheDocument();
    for (const heading of ['Txn Type', 'Status', 'Price', 'Fulfilment', 'Timestamp', 'Actions']) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
    const rows = rowCells();
    expect(rows).toHaveLength(seeded.length);
    expect(rows[0][1]).toContain(seeded.at(-1)!.productId);
    expect(rows).toContainEqual([
      'Sell',
      'ETH-USD 37.50% fulfilling',
      'limit 2,540.00',
      '0.75 / 2 Coinbase',
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
      'Sell',
      'ETH-USD 0.00% pending',
      'market 100.50',
      '0 / 0.25 Coinbase',
      '12/09/2026, 10:30:00',
      '',
    ]);
    expect(rows[1]).toEqual([
      'Buy',
      'BTC-USD 0.00% pending',
      'market 100.50',
      '0 / 2 Coinbase',
      '12/09/2026, 10:30:00',
      '',
    ]);
    vi.useRealTimers();
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
