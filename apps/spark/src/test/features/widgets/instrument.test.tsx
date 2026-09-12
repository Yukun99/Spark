import type { Ticker } from '@/connections/coinbase';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { InstrumentWidget } from '@/features/widgets/instrument';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const ticker: Ticker = {
  productId: 'BTC-USD',
  bid: 100.5,
  ask: 101,
  price: 100.7,
  time: '2026-09-12T13:45:12.345678Z',
  receivedAt: 0,
};

vi.mock('@/connections/coinbase', () => ({
  coinbaseFeed: {
    subscribe: () => () => undefined,
    getTicker: () => ticker,
    setUpdateInterval: () => undefined,
  },
  getCoinbaseProducts: () => Promise.resolve([]),
}));

const renderWidget = () => {
  const store = createAppStore();
  const widget = store.getState().widgets.items[0];
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
  it('shows the product with bid and ask prices', () => {
    renderWidget();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('100.50')).toBeInTheDocument();
    expect(screen.getByText('101.00')).toBeInTheDocument();
  });

  it('shows the exchange timestamp of the latest tick', () => {
    renderWidget();
    const local = new Date('2026-09-12T13:45:12.345Z');
    const hh = String(local.getHours()).padStart(2, '0');
    const mm = String(local.getMinutes()).padStart(2, '0');
    expect(screen.getByText(`Last Refresh: ${hh}:${mm}:12.345`)).toBeInTheDocument();
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
    expect(store.getState().widgets.items).toHaveLength(0);
  });
});
