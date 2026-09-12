import type { CoinbaseProduct, Ticker } from '@/connections/coinbase';
import { WidgetGrid } from '@/features/grid/widgetGrid';
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
  'BTC-USD': { bid: 100.5, ask: 101 },
  'ETH-USD': { bid: 10.25, ask: 10.5 },
};

vi.mock('@/connections/coinbase', () => ({
  coinbaseFeed: {
    subscribe: () => () => undefined,
    getTicker: (productId: string) => tickers[productId],
    setUpdateInterval: () => undefined,
    setFocus: () => undefined,
  },
  getCoinbaseProducts: () => Promise.resolve(['BTC-USD', 'ETH-USD', 'SOL-USD'].map(product)),
}));

const renderWatchlist = (productIds: string[] = []) => {
  const store = createAppStore();
  store.dispatch(addWidget('watchlist'));
  const id = store.getState().widgets.items[1].id;
  store.dispatch(setWatchlist({ id, name: 'Watchlist', productIds }));
  const Bound = () => {
    const widget = store.getState().widgets.items[1];
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

  it('lists each instrument with its bid and ask', () => {
    renderWatchlist(['BTC-USD', 'ETH-USD']);
    expect(screen.getByText('Watchlist (2)')).toBeInTheDocument();
    const rows = screen.getAllByTestId('watchlist-row');
    expect(rows.map((row) => row.textContent)).toEqual([
      'BTC-USD 100.50 / 101.00',
      'ETH-USD 10.25 / 10.50',
    ]);
  });

  it('renames and adds instruments through the edit dialog', async () => {
    const user = userEvent.setup();
    const { store, id } = renderWatchlist(['BTC-USD']);
    store.dispatch(toggleEditMode());

    await user.click(await screen.findByRole('button', { name: 'Modify widget' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit watchlist' });
    const nameField = within(dialog).getByLabelText('Name');
    expect(nameField).toHaveValue('Watchlist');
    expect(within(dialog).getAllByRole('combobox')).toHaveLength(1);

    await user.clear(nameField);
    await user.type(nameField, 'Majors');
    await user.click(within(dialog).getByRole('button', { name: 'Add instrument' }));
    const inputs = within(dialog).getAllByRole('combobox');
    expect(inputs).toHaveLength(2);
    await user.type(inputs[1], 'eth');
    await user.click(await screen.findByRole('option', { name: 'ETH-USD' }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(store.getState().widgets.items.find((item) => item.id === id)).toMatchObject({
      name: 'Majors',
      productIds: ['BTC-USD', 'ETH-USD'],
    });
  });
});
