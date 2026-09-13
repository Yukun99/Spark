import type { Ticker } from '@/connections/coinbase';
import { OrdersWidget } from '@/features/widgets/orders/orders';
import { toggleEditMode } from '@/store/layoutSlice';
import { placeOrder, type OrderDraft } from '@/store/ordersSlice';
import { createAppStore, type AppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { manyOrders, sampleOrders, seedOrders } from '@/test/fixtures/orders';
import { act, render, screen, waitFor, within } from '@testing-library/react';
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

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

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

/** Places an order through the store, which reloads the page with it on top. */
const place = (store: AppStore, draft: OrderDraft) => act(() => store.dispatch(placeOrder(draft)));

const renderOrders = (orders = sampleOrders()) => {
  const fake = installFakeApi({ orders });
  const store = createAppStore();
  seedOrders(store);
  fakeApi = fake;
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

let fakeApi: ReturnType<typeof installFakeApi>;

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

const pageField = () => screen.getByRole('textbox', { name: 'Page' });
const pageButton = (name: string) => screen.getByRole('button', { name });

describe('OrdersWidget', () => {
  afterEach(() => vi.useRealTimers());

  it('has a header and a row per order on the page, newest first', () => {
    const store = renderOrders();
    const seeded = store.getState().orders.items;
    expect(screen.getByText('Orders (10)')).toBeInTheDocument();
    for (const heading of ['Instrument', 'Status', 'Price', 'Fulfilment', 'Submission Time', 'Actions']) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
    const rows = rowCells();
    expect(rows).toHaveLength(seeded.length);
    expect(rows[0][0]).toBe(seeded[0].productId);
    expect(rows[0][0]).toBe('LTC-USD');
    expect(rows).toContainEqual([
      'ETH-USD',
      'Sellfulfilling37.50%',
      'limit2,540.00',
      'Coinbase0.75 / 2',
      expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/),
      '',
    ]);
  });

  it('adds placed orders on top as pending with nothing filled', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 13, 10, 30, 0));
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
    await place(store, draft);
    await place(store, { ...draft, productId: 'ETH-USD', side: 'sell', size: 0.25 });

    const rows = rowCells();
    expect(rows).toHaveLength(store.getState().orders.items.length);
    expect(screen.getByText('Orders (12)')).toBeInTheDocument();
    expect(rows[0]).toEqual([
      'ETH-USD',
      'Sellpending0.00%',
      'market100.50',
      'Coinbase0 / 0.25',
      '13/09/2026, 10:30:00',
      '',
    ]);
    expect(rows[1]).toEqual([
      'BTC-USD',
      'Buypending0.00%',
      'market100.50',
      'Coinbase0 / 2',
      '13/09/2026, 10:30:00',
      '',
    ]);
  });

  it('flashes only the orders placed just now', async () => {
    const store = renderOrders();
    expect(rowGlows()).not.toContain(true);
    await place(store, {
      productId: 'BTC-USD',
      side: 'buy',
      type: 'market',
      timeInForce: 'GTC',
      price: 1,
      size: 1,
      provider: 'Coinbase',
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

  it('has copy, modify and cancel actions on every row, modify and cancel only while open', () => {
    const store = renderOrders();
    const orders = store.getState().orders.items;
    for (const name of ['Copy order', 'Modify order', 'Cancel order']) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(orders.length);
    }
    const open = orders.filter((order) => ['pending', 'fulfilling'].includes(order.status));
    for (const name of ['Modify order', 'Cancel order']) {
      const enabled = screen
        .getAllByRole('button', { name })
        .filter((button) => !(button as HTMLButtonElement).disabled);
      expect(enabled).toHaveLength(open.length);
    }
    expect(screen.getAllByRole('button', { name: 'Copy order' }).some((b) => (b as HTMLButtonElement).disabled)).toBe(false);
    expect(open.length).toBeGreaterThan(0);
    expect(open.length).toBeLessThan(orders.length);
  });

  it('cancels an order after confirmation, keeping it if the user backs out', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const source = store.getState().orders.items.find((order) => order.productId === 'ETH-USD')!;
    const row = screen.getAllByTestId('order-row').find((item) => item.textContent?.startsWith('ETH-USD'))!;

    await user.click(within(row).getByRole('button', { name: 'Cancel order' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Cancel order?');
    expect(dialog).toHaveTextContent('sell order for ETH-USD');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(store.getState().orders.items.find((order) => order.id === source.id)).toEqual(source);

    await user.click(within(row).getByRole('button', { name: 'Cancel order' }));
    expect(rowGlows()).not.toContain(true);
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(store.getState().orders.items.find((order) => order.id === source.id)).toEqual({
      ...source,
      status: 'cancelled',
      updatedAt: expect.any(Number),
    });
    expect(row).toHaveTextContent('cancelled');
    expect(row).toHaveTextContent('0.75 / 2');
    expect(within(row).getByRole('button', { name: 'Cancel order' })).toBeDisabled();
    expect(within(row).getByRole('button', { name: 'Modify order' })).toBeDisabled();
    expect(rowGlows().filter(Boolean)).toHaveLength(1);
  });

  it('modifies an order in place, offering the unfilled size and keeping the fill', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const source = store.getState().orders.items.find((order) => order.productId === 'ETH-USD')!;
    expect(source).toMatchObject({ status: 'fulfilling', size: 2, filledSize: 0.75 });
    const row = screen.getAllByTestId('order-row').find((item) => item.textContent?.startsWith('ETH-USD'))!;
    await user.click(within(row).getByRole('button', { name: 'Modify order' }));

    const dialog = await screen.findByRole('dialog');
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
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
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

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Place Order');
    expect(within(dialog).getByLabelText('ETH-USD details')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'SELL' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByRole('radio', { name: 'Limit' })).toBeChecked();
    expect(within(dialog).getByRole('radio', { name: 'GTC' })).toBeChecked();
    expect(within(dialog).getByRole('textbox', { name: 'Price' })).toHaveValue('2540');
    expect(within(dialog).getByRole('textbox', { name: 'Size' })).toHaveValue('2');
    expect(within(dialog).getByRole('textbox', { name: 'Provider' })).toHaveValue('Coinbase');

    const count = store.getState().orders.total;
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(store.getState().orders.total).toBe(count + 1));
    expect(store.getState().orders.items[0]).toEqual(
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

  it('reloads the orders from the server on refresh, hiding the button in edit mode', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const target = fakeApi.state.orders.find((order) => order.productId === 'SOL-USD')!;
    Object.assign(target, { status: 'fulfilling', filledSize: 5 });
    expect(rowCells().find((row) => row[0] === 'SOL-USD')?.[1]).toBe('Buypending0.00%');

    await user.click(screen.getByRole('button', { name: 'Refresh orders' }));
    await waitFor(() =>
      expect(rowCells().find((row) => row[0] === 'SOL-USD')?.[1]).toBe('Buyfulfilling20.00%'),
    );
    expect(fakeApi.calls).toEqual([{ path: '/orders?page=1&pageSize=10', request: {} }]);

    await act(() => store.dispatch(toggleEditMode()));
    expect(screen.queryByRole('button', { name: 'Refresh orders' })).not.toBeInTheDocument();
  });

  it('filters through the server from the filter dialog and shows the active state', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const filterButton = screen.getByRole('button', { name: 'Filter orders' });
    expect(screen.queryByText('Filtered')).not.toBeInTheDocument();

    await user.click(filterButton);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Filter Orders');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Cancelled' }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(rowCells()).toHaveLength(1));
    expect(rowCells()[0][0]).toBe('LTC-USD');
    expect(store.getState().orders.filter).toEqual({ statuses: ['cancelled'] });
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&status=cancelled');
    expect(screen.getByText('Filtered')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter orders' }));
    const reopened = await screen.findByRole('dialog');
    expect(within(reopened).getByRole('checkbox', { name: 'Cancelled' })).toBeChecked();
    await user.click(within(reopened).getByRole('button', { name: 'Clear filters' }));
    expect(within(reopened).getByRole('checkbox', { name: 'Cancelled' })).not.toBeChecked();
    await user.click(within(reopened).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(rowCells()).toHaveLength(sampleOrders().length));
    expect(screen.queryByText('Filtered')).not.toBeInTheDocument();
  });

  it('sorts through the server by clicking a heading: ascending, descending, off', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    const heading = (name: string) => screen.getByRole('button', { name });
    const glyphs = (button: HTMLElement) =>
      Array.from(button.querySelectorAll('svg')).map((icon) => icon.getAttribute('data-testid'));
    for (const name of ['Instrument', 'Status', 'Price', 'Fulfilment', 'Submission Time']) {
      expect(heading(name)).toHaveAttribute('aria-sort', 'none');
      expect(glyphs(heading(name))).toEqual(['ArrowDropUpIcon', 'ArrowDropDownIcon']);
    }
    expect(screen.queryByRole('button', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.queryByText('Sorted')).not.toBeInTheDocument();

    await user.click(heading('Instrument'));
    await waitFor(() => expect(rowCells()[0][0]).toBe('ADA-USD'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&sort=instrument&direction=asc');
    expect(heading('Instrument')).toHaveAttribute('aria-sort', 'ascending');
    expect(glyphs(heading('Instrument'))).toEqual(['ArrowDropUpIcon']);
    expect(screen.getByText('Sorted')).toBeInTheDocument();

    await user.click(heading('Instrument'));
    await waitFor(() => expect(rowCells()[0][0]).toBe('XRP-USD'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&sort=instrument&direction=desc');
    expect(heading('Instrument')).toHaveAttribute('aria-sort', 'descending');
    expect(glyphs(heading('Instrument'))).toEqual(['ArrowDropDownIcon']);

    await user.click(heading('Price'));
    await waitFor(() => expect(rowCells()[0][0]).toBe('DOGE-USD'));
    expect(store.getState().orders.sort).toEqual({ column: 'price', direction: 'asc' });
    expect(heading('Instrument')).toHaveAttribute('aria-sort', 'none');
    expect(heading('Price')).toHaveAttribute('aria-sort', 'ascending');

    await user.click(heading('Price'));
    await user.click(heading('Price'));
    await waitFor(() => expect(store.getState().orders.sort).toBeNull());
    await waitFor(() => expect(rowCells()[0][0]).toBe('LTC-USD'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    expect(heading('Price')).toHaveAttribute('aria-sort', 'none');
    expect(screen.queryByText('Sorted')).not.toBeInTheDocument();
  });

  it('clears the sort from the corner button, going back to the first page', async () => {
    const user = userEvent.setup();
    const store = renderOrders(manyOrders(25));
    await user.click(pageButton('Refresh orders'));
    await waitFor(() => expect(screen.getByText('Orders (25)')).toBeInTheDocument());
    const calls = fakeApi.calls.length;
    await user.click(pageButton('Cancel sort'));
    expect(fakeApi.calls).toHaveLength(calls);

    await user.click(screen.getByRole('button', { name: 'Submission Time' }));
    await waitFor(() => expect(store.getState().orders.sort).toEqual({ column: 'placedAt', direction: 'asc' }));
    await user.click(pageButton('Next page'));
    await waitFor(() => expect(pageField()).toHaveValue('2'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=2&pageSize=10&sort=placedAt&direction=asc');

    await user.click(pageButton('Cancel sort'));
    await waitFor(() => expect(store.getState().orders.sort).toBeNull());
    await waitFor(() => expect(pageField()).toHaveValue('1'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    expect(screen.getByRole('button', { name: 'Submission Time' })).toHaveAttribute('aria-sort', 'none');
  });

  it('pages through the server with the page bar, accepting only pages in range', async () => {
    const user = userEvent.setup();
    const store = renderOrders(manyOrders(25));
    await user.click(pageButton('Refresh orders'));
    await waitFor(() => expect(screen.getByText('Orders (25)')).toBeInTheDocument());
    expect(screen.getByText('/ 3')).toBeInTheDocument();
    expect(pageField()).toHaveValue('1');
    expect(pageButton('First page')).toBeDisabled();
    expect(pageButton('Previous page')).toBeDisabled();
    expect(rowCells()).toHaveLength(10);
    expect(rowCells()[0][0]).toBe(store.getState().orders.items[0].productId);

    await user.click(pageButton('Next page'));
    await waitFor(() => expect(pageField()).toHaveValue('2'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=2&pageSize=10');
    await user.click(pageButton('Last page'));
    await waitFor(() => expect(pageField()).toHaveValue('3'));
    expect(rowCells()).toHaveLength(5);
    expect(pageButton('Next page')).toBeDisabled();
    expect(pageButton('Last page')).toBeDisabled();
    await user.click(pageButton('Previous page'));
    await waitFor(() => expect(pageField()).toHaveValue('2'));
    await user.click(pageButton('First page'));
    await waitFor(() => expect(pageField()).toHaveValue('1'));

    await user.click(pageField());
    await user.keyboard('4');
    expect(pageField()).toHaveValue('1');
    await user.keyboard('{Backspace}3{Enter}');
    await waitFor(() => expect(pageField()).toHaveValue('3'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=3&pageSize=10');
    expect(store.getState().orders.page).toBe(3);

    const calls = fakeApi.calls.length;
    await user.click(pageButton('Refresh orders'));
    await waitFor(() => expect(fakeApi.calls).toHaveLength(calls + 1));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=3&pageSize=10');

    await user.click(pageButton('Filter orders'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Cancelled' }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(pageField()).toHaveValue('1'));
    expect(fakeApi.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&status=cancelled');
    expect(screen.getByText('/ 1')).toBeInTheDocument();
  });

  it('offers delete but no modify in edit mode', async () => {
    const user = userEvent.setup();
    const store = renderOrders();
    await act(() => store.dispatch(toggleEditMode()));
    expect(await screen.findByRole('button', { name: 'Delete widget' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modify widget' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete widget' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));
    expect(store.getState().widgets.items.some((widget) => widget.type === 'orders')).toBe(false);
  });
});
