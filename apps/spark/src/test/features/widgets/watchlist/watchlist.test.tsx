import type { CoinbaseProduct, Ticker } from '@/connections/coinbase';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { formatTime } from '@/features/widgets/instrument/tickerFormat';
import { WatchlistWidget } from '@/features/widgets/watchlist/watchlist';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { addWidget, setWatchlist } from '@/store/widgetsSlice';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const product = (id: string): CoinbaseProduct => ({
  id,
  base_currency: id.split('-')[0],
  quote_currency: id.split('-')[1],
  display_name: id.replace('-', '/'),
  status: 'online',
});

const tickers: Record<string, Partial<Ticker>> = {
  'BTC-USD': { bid: 100.5, ask: 101, price: 100.75, lastSize: 0.5, side: 'buy', receivedAt: 1_000 },
  'ETH-USD': { bid: 10.25, ask: 10.5 },
};

vi.mock('@/connections/coinbase', () => ({
  coinbaseFeed: {
    subscribe: () => () => undefined,
    getTicker: (productId: string) => tickers[productId],
    setUpdateInterval: () => undefined,
    setStreaming: () => undefined,
    setFocus: () => undefined,
  },
  getCoinbaseProducts: () => Promise.resolve(['BTC-USD', 'ETH-USD', 'SOL-USD'].map(product)),
}));

const renderWatchlist = (productIds: string[] = []) => {
  const store = createAppStore();
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
    const refreshed = `Last Refresh: ${formatTime(1_000)}`;
    expect(screen.getByText('Watchlist (2)')).toBeInTheDocument();
    expect(screen.getAllByText(refreshed)).toHaveLength(2);
    for (const header of ['Instrument', 'Bid Price', 'Ask Price', 'Last Price', 'Last Size']) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }
    const rows = screen.getAllByTestId('watchlist-row');
    const texts = (row: HTMLElement) =>
      within(row)
        .getAllByText(/./)
        .map((cell) => cell.textContent);
    expect(rows.map(texts)).toEqual([
      ['BTC-USD', refreshed, '100.50', '101.00', '100.75', '0.5'],
      ['ETH-USD', 'Last Refresh: --', '10.25', '10.50', '--', '--'],
    ]);
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
    expect(within(btc).getByTestId('freshness-glow')).toBeInTheDocument();
    expect(within(eth).queryByTestId('freshness-glow')).not.toBeInTheDocument();
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
