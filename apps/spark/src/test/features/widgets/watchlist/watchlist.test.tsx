import type { CoinbaseProduct, Ticker } from '@/connections/coinbase';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { WatchlistWidget } from '@/features/widgets/watchlist/watchlist';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { addWidget, removeWidget, setWatchlist } from '@/store/widgetsSlice';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const product = (id: string): CoinbaseProduct => ({
  id,
  base_currency: id.split('-')[0],
  quote_currency: id.split('-')[1],
  display_name: id.replace('-', '/'),
  status: 'online',
});

const baseTickers = (): Record<string, Partial<Ticker>> => ({
  'BTC-USD': { bid: 100.5, ask: 101, price: 100.75, lastSize: 0.5, side: 'buy', receivedAt: 1_000 },
  'ETH-USD': { bid: 10.25, ask: 10.5 },
});
let tickers = baseTickers();
beforeEach(() => {
  tickers = baseTickers();
});

const listeners: Record<string, Set<() => void>> = {};

/** Pushes a tick for one product through the mocked feed, as the interval notifier would. */
const tick = (productId: string, next: Partial<Ticker>) => {
  tickers[productId] = { ...tickers[productId], ...next };
  act(() => listeners[productId]?.forEach((listener) => listener()));
};

vi.mock('@/connections/coinbase', () => ({
  coinbaseFeed: {
    subscribe: (productId: string, listener: () => void) => {
      (listeners[productId] ??= new Set()).add(listener);
      return () => listeners[productId].delete(listener);
    },
    getTicker: (productId: string) => tickers[productId],
    setUpdateInterval: () => undefined,
    setStreaming: () => undefined,
    setFocus: () => undefined,
  },
  getCoinbaseProducts: () => Promise.resolve(['BTC-USD', 'ETH-USD', 'SOL-USD'].map(product)),
}));

const renderWatchlist = (productIds: string[] = []) => {
  const store = createAppStore();
  store.dispatch(removeWidget('orders'));
  store.dispatch(addWidget('watchlist'));
  const id = store.getState().widgets.items.at(-1)!.id;
  store.dispatch(setWatchlist({ id, name: 'Watchlist', productIds }));
  const Bound = () => {
    const widget = store.getState().widgets.items.at(-1)!;
    if (widget.type !== 'watchlist') throw new Error('expected a watchlist widget');
    return <WatchlistWidget widget={widget} />;
  };
  render(
    <Provider store={store}>
      <WidgetGrid layouts={[]}>
        <Bound />
      </WidgetGrid>
    </Provider>,
  );
  return { store, id };
};

describe('WatchlistWidget', () => {
  it('shows a placeholder when empty and a bid/ask line per instrument otherwise', () => {
    renderWatchlist();
    expect(screen.getByText('Watchlist (0)')).toBeInTheDocument();
    expect(screen.getByText('No instruments yet')).toBeInTheDocument();
  });

  it('lists each instrument under column headers with bid/ask and price/size', () => {
    renderWatchlist(['BTC-USD', 'ETH-USD']);
    expect(screen.getByText('Watchlist (2)')).toBeInTheDocument();
    for (const header of ['Instrument', 'Bid Price', 'Ask Price', 'Last Price', 'Last Size']) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }
    const rows = screen.getAllByTestId('watchlist-row');
    const texts = (row: HTMLElement) =>
      within(row)
        .getAllByText(/./)
        .map((cell) => cell.textContent);
    expect(rows.map(texts)).toEqual([
      ['BTC-USD', '100.50', '101.00', '100.75', '0.5'],
      ['ETH-USD', '10.25', '10.50', '--', '--'],
    ]);
  });

  it('pages the instruments client-side, counting all of them in the title', async () => {
    const user = userEvent.setup();
    const ids = Array.from({ length: 12 }, (_, index) => `C${index}-USD`);
    renderWatchlist(ids);
    expect(screen.getByText('Watchlist (12)')).toBeInTheDocument();
    expect(screen.getByText('/ 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('watchlist-row')).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    const rows = screen.getAllByTestId('watchlist-row');
    expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual(['C10-USD details', 'C11-USD details']);
    expect(screen.getByRole('textbox', { name: 'Page' })).toHaveValue('2');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    await user.click(screen.getByRole('textbox', { name: 'Page' }));
    await user.keyboard('3');
    expect(screen.getByRole('textbox', { name: 'Page' })).toHaveValue('2');
    await user.keyboard('{Backspace}1');
    await user.tab();
    expect(screen.getAllByTestId('watchlist-row')).toHaveLength(10);
  });

  it('opens the instrument details when a row is clicked', async () => {
    const user = userEvent.setup();
    renderWatchlist(['BTC-USD', 'ETH-USD']);
    await user.click(screen.getByText('ETH-USD'));
    const dialog = await screen.findByRole('dialog', { name: 'ETH-USD details' });
    await user.click(within(dialog).getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('glows only the row that has received a tick', () => {
    renderWatchlist(['BTC-USD', 'ETH-USD']);
    const [btc, eth] = screen.getAllByTestId('watchlist-row');
    expect(within(btc).getByText('0.5')).toHaveAttribute('data-side', 'buy');
    expect(within(btc).getByTestId('freshness-glow')).toBeVisible();
    expect(within(eth).getByTestId('freshness-glow')).not.toBeVisible();
  });

  it('writes ticks into the row cells in place, without re-rendering', () => {
    const { store } = renderWatchlist(['BTC-USD', 'ETH-USD']);
    const [, eth] = screen.getAllByTestId('watchlist-row');
    const before = store.getState().widgets.items.at(-1);
    tick('ETH-USD', { bid: 11, ask: 12, price: 11.5, lastSize: 2, side: 'sell', receivedAt: 2_000 });

    const cells = within(eth)
      .getAllByText(/./)
      .map((cell) => cell.textContent);
    expect(cells).toEqual(['ETH-USD', '11.00', '12.00', '11.50', '2']);
    expect(within(eth).getByText('2')).toHaveAttribute('data-side', 'sell');
    expect(within(eth).getByTestId('freshness-glow')).toBeVisible();
    expect(store.getState().widgets.items.at(-1)).toBe(before);
  });

  const openDialog = async (user: ReturnType<typeof userEvent.setup>, productIds: string[]) => {
    const { store, id } = renderWatchlist(productIds);
    store.dispatch(toggleEditMode());
    await user.click(await screen.findByRole('button', { name: 'Modify widget' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit watchlist' });
    const rows = () => within(dialog).getAllByRole('combobox');
    const confirm = () => within(dialog).getByRole('button', { name: 'Confirm' });
    return { store, id, dialog, rows, confirm };
  };

  it('renames and adds instruments through the edit dialog, always leaving a blank row', async () => {
    const user = userEvent.setup();
    const { store, id, dialog, rows, confirm } = await openDialog(user, ['BTC-USD']);
    const nameField = within(dialog).getByLabelText('Name');
    expect(nameField).toHaveValue('Watchlist');
    expect(rows()).toHaveLength(2);
    expect(rows()[0]).toHaveValue('BTC-USD');

    await user.clear(nameField);
    await user.type(nameField, 'Majors');
    await user.type(rows()[1], 'eth');
    await user.click(await screen.findByRole('option', { name: 'ETH-USD' }));
    expect(rows()).toHaveLength(3);
    expect(rows()[2]).toHaveValue('');
    await user.click(confirm());

    expect(store.getState().widgets.items.find((item) => item.id === id)).toMatchObject({
      name: 'Majors',
      productIds: ['BTC-USD', 'ETH-USD'],
    });
  });

  it('scrolls the new blank row into view once the last one is filled', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { rows } = await openDialog(user, ['BTC-USD']);
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.type(rows()[1], 'eth');
    await user.click(await screen.findByRole('option', { name: 'ETH-USD' }));
    expect(rows()).toHaveLength(3);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toContainElement(rows()[2]);
  });

  it('reorders instruments by dragging their handles; the blank row has none', async () => {
    const user = userEvent.setup();
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    const { store, id, dialog, rows, confirm } = await openDialog(user, ['BTC-USD', 'ETH-USD', 'SOL-USD']);
    const handle = (name: string) => within(dialog).getByRole('button', { name: `Reorder ${name}` });
    expect(within(dialog).getAllByRole('button', { name: /^Reorder / })).toHaveLength(3);

    const ROW_PX = 40;
    const rowOf = (combobox: HTMLElement) => combobox.closest('[class*="MuiStack-root"]') as HTMLElement;
    const values = () => rows().map((combobox) => (combobox as HTMLInputElement).value);
    rows().forEach((combobox, index) => {
      vi.spyOn(rowOf(combobox), 'getBoundingClientRect').mockReturnValue({
        top: index * ROW_PX,
        bottom: (index + 1) * ROW_PX,
      } as DOMRect);
    });

    fireEvent.pointerDown(handle('BTC-USD'), { button: 0, pointerId: 1, clientY: 20 });
    fireEvent.pointerMove(handle('BTC-USD'), { pointerId: 1, clientY: 60 });
    expect(values()).toEqual(['BTC-USD', 'ETH-USD', 'SOL-USD', '']);
    expect(rowOf(rows()[0])).toHaveStyle({ transform: 'translateY(40px)' });
    expect(rowOf(rows()[1])).toHaveStyle({ transform: `translateY(${-ROW_PX}px)` });
    expect(rowOf(rows()[2])).not.toHaveStyle({ transform: `translateY(${-ROW_PX}px)` });

    fireEvent.pointerMove(handle('BTC-USD'), { pointerId: 1, clientY: 500 });
    expect(rowOf(rows()[0])).toHaveStyle({ transform: `translateY(${2 * ROW_PX}px)` });
    expect(rowOf(rows()[2])).toHaveStyle({ transform: `translateY(${-ROW_PX}px)` });
    fireEvent.pointerUp(handle('BTC-USD'), { pointerId: 1, clientY: 500 });
    expect(values()).toEqual(['ETH-USD', 'SOL-USD', 'BTC-USD', '']);
    expect(rowOf(rows()[0]).style.transform).toBe('');

    await user.click(confirm());
    expect(store.getState().widgets.items.find((item) => item.id === id)).toMatchObject({
      productIds: ['ETH-USD', 'SOL-USD', 'BTC-USD'],
    });
  });

  it('flags unknown text on blur, blocks confirm until fixed, and removes rows', async () => {
    const user = userEvent.setup();
    const { store, id, dialog, rows, confirm } = await openDialog(user, ['BTC-USD', 'ETH-USD']);
    expect(rows()).toHaveLength(3);

    await user.type(rows()[2], 'zzz');
    expect(confirm()).toBeDisabled();
    expect(rows()[2]).not.toHaveAttribute('aria-invalid', 'true');
    await user.tab();
    expect(rows()[2]).toHaveAttribute('aria-invalid', 'true');
    expect(confirm()).toBeDisabled();

    await user.click(within(dialog).getByRole('button', { name: 'Remove zzz' }));
    expect(rows()).toHaveLength(3);
    expect(rows()[2]).toHaveValue('');
    expect(confirm()).toBeEnabled();

    await user.click(within(dialog).getByRole('button', { name: 'Remove BTC-USD' }));
    expect(rows()).toHaveLength(2);
    expect(rows()[0]).toHaveValue('ETH-USD');
    await user.click(confirm());
    expect(store.getState().widgets.items.find((item) => item.id === id)).toMatchObject({
      productIds: ['ETH-USD'],
    });
  });
});
