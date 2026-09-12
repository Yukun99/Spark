import type { Ticker } from '@/connections/coinbase';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { InstrumentWidget } from '@/features/widgets/instrument/instrument';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { render, screen, within } from '@testing-library/react';
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
  tradeId: 12345,
  time: '2026-09-12T13:45:12.345678Z',
  receivedAt: 0,
  open24h: 90,
  high24h: 110,
  low24h: 80,
  volume24h: 1000,
  volume30d: 30000,
};

const setFocus = vi.fn();

vi.mock('@/connections/coinbase', () => ({
  COINBASE_PROVIDER: 'Coinbase',
  coinbaseFeed: {
    subscribe: () => () => undefined,
    getTicker: () => ticker,
    setUpdateInterval: () => undefined,
    setStreaming: () => undefined,
    setFocus: (productId: string | null) => setFocus(productId),
  },
  getCoinbaseProducts: () => Promise.resolve([]),
}));

const renderWidget = () => {
  const store = createAppStore();
  const widget = store.getState().widgets.items[0];
  if (widget.type !== 'instrument') throw new Error('expected an instrument widget');
  render(
    <Provider store={store}>
      <WidgetGrid layouts={[widget.layout]}>
        <InstrumentWidget widget={widget} />
      </WidgetGrid>
    </Provider>,
  );
  return store;
};

describe('InstrumentWidget', () => {
  it('shows the product with bid, ask and the last trade', () => {
    renderWidget();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('100.50')).toBeInTheDocument();
    expect(screen.getByText('101.00')).toBeInTheDocument();
    expect(screen.getByText('Last Price')).toBeInTheDocument();
    expect(screen.getByText('100.70')).toBeInTheDocument();
    expect(screen.getByText('Last Size')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toHaveAttribute('data-side', 'buy');
  });

  it('opens the Place Order dialog from BUY and stores the confirmed order', async () => {
    const user = userEvent.setup();
    const store = renderWidget();
    const buy = screen.getByRole('button', { name: 'BUY' });
    expect(buy).toHaveAttribute('data-side', 'buy');
    expect(screen.getByRole('button', { name: 'SELL' })).toHaveAttribute('data-side', 'sell');

    await user.click(buy);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Place Order');
    expect(screen.queryByRole('dialog', { name: 'BTC-USD details' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: 'Price' })).toHaveValue('101');

    await user.type(within(dialog).getByRole('textbox', { name: 'Size' }), '2');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getState().orders.items.at(-1)).toEqual(
      expect.objectContaining({ productId: 'BTC-USD', side: 'buy', price: 101, size: 2 }),
    );
  });

  it('swaps the details dialog for the order dialog when SELL is clicked inside it', async () => {
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: 'Expand widget' }));
    const details = await screen.findByRole('dialog', { name: 'BTC-USD details' });
    await user.click(within(details).getByRole('button', { name: 'SELL' }));

    expect(screen.queryByRole('dialog', { name: 'BTC-USD details' })).not.toBeInTheDocument();
    const order = screen.getByRole('dialog');
    expect(order).toHaveTextContent('Place Order');
    expect(within(order).getByRole('textbox', { name: 'Price' })).toHaveValue('100.5');
    expect(setFocus).toHaveBeenLastCalledWith('BTC-USD');
  });

  it('shows the exchange timestamp of the latest tick', () => {
    renderWidget();
    const local = new Date('2026-09-12T13:45:12.345Z');
    const hh = String(local.getHours()).padStart(2, '0');
    const mm = String(local.getMinutes()).padStart(2, '0');
    expect(screen.getByText(`Last Refresh: ${hh}:${mm}:12.345`)).toBeInTheDocument();
  });

  it('opens the details dialog from the card, focuses the feed and closes again', async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(screen.getByTestId('widget-frame'));
    const dialog = await screen.findByRole('dialog', { name: 'BTC-USD details' });
    expect(dialog).toHaveTextContent('Spread');
    expect(dialog).toHaveTextContent('0.50');
    expect(dialog).toHaveTextContent('24H Change %');
    expect(dialog).toHaveTextContent('+11.89%');
    expect(within(dialog).getByRole('button', { name: 'BUY' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'SELL' })).toBeInTheDocument();
    expect(setFocus).toHaveBeenLastCalledWith('BTC-USD');

    await user.click(screen.getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(setFocus).toHaveBeenLastCalledWith(null);
  });

  it('opens the details dialog from the expand icon', async () => {
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: 'Expand widget' }));
    expect(await screen.findByRole('dialog', { name: 'BTC-USD details' })).toBeInTheDocument();
  });

  it('replaces content with the name and actions in edit mode, and deletes after confirming', async () => {
    const user = userEvent.setup();
    const store = renderWidget();
    store.dispatch(toggleEditMode());

    expect(await screen.findByRole('button', { name: 'Delete widget' })).toBeInTheDocument();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.queryByText('100.50')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete widget' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(store.getState().widgets.items.map((widget) => widget.id)).toEqual(['eth', 'common', 'orders']);
  });
});
