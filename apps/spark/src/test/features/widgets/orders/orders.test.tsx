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

describe('OrdersWidget', () => {
  it('is seeded with a line per stored order, newest first', () => {
    const store = renderOrders();
    const seeded = store.getState().orders.items;
    expect(screen.getByText('Orders')).toBeInTheDocument();
    const rows = screen.getAllByTestId('order-row').map((row) => row.textContent);
    expect(rows).toHaveLength(seeded.length);
    expect(rows[0]).toContain(seeded.at(-1)!.productId);
    expect(rows.join(' ')).toContain(' | 2 | 0.75 | 37.50% | fulfilling | ');
  });

  it('adds placed orders on top as pending with nothing filled', () => {
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

    const rows = screen.getAllByTestId('order-row').map((row) => row.textContent);
    expect(rows).toHaveLength(store.getState().orders.items.length);
    expect(rows[0]).toContain('ETH-USD | sell | market | GTC | 100.50 | 0.25 | 0 | 0.00% | pending | Coinbase | ');
    expect(rows[1]).toContain('BTC-USD | buy | market | GTC | 100.50 | 2 | 0 | 0.00% | pending | Coinbase | ');
    expect(rows[1]?.split(' | ')).toHaveLength(11);
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
