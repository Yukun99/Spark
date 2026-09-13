import type { CoinbaseProduct } from '@/connections/coinbase';
import { InstrumentSearchDialog } from '@/features/widgets/instrument/dialog/instrumentSearchDialog';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const product = (id: string): CoinbaseProduct => ({
  id,
  base_currency: id.split('-')[0],
  quote_currency: id.split('-')[1],
  display_name: id.replace('-', '/'),
  status: 'online',
});

const PRODUCTS = [
  'ADA-USD',
  'BTC-USD',
  'BTC-USDC',
  'BTC-USDT',
  'BTCA-USD',
  'BTCB-USD',
  'BTCC-USD',
  'BTCD-USD',
  'ETH-USD',
].map(product);

const getCoinbaseProducts = vi.fn<() => Promise<CoinbaseProduct[]>>();

vi.mock('@/connections/coinbase', () => ({
  getCoinbaseProducts: () => getCoinbaseProducts(),
}));

const renderDialog = () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<InstrumentSearchDialog productId='BTC-USD' onConfirm={onConfirm} onCancel={onCancel} />);
  return { onConfirm, onCancel };
};

describe('InstrumentSearchDialog', () => {
  beforeEach(() => {
    getCoinbaseProducts.mockResolvedValue(PRODUCTS);
  });

  it('seeds the current instrument and confirms it unchanged', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    expect(await screen.findByRole('combobox')).toHaveValue('BTC-USD');
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith('BTC-USD');
  });

  it('filters by id prefix, caps suggestions at five, and confirms the chosen product', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();
    const input = await screen.findByRole('combobox');

    await user.clear(input);
    await user.type(input, 'btc');
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'BTC-USD',
      'BTC-USDC',
      'BTC-USDT',
      'BTCA-USD',
      'BTCB-USD',
    ]);

    await user.clear(input);
    await user.type(input, 'eth');
    await user.click(await screen.findByRole('option', { name: 'ETH-USD' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith('ETH-USD');
  });

  it('disables confirm once the selection is cleared and cancels without confirming', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();
    const input = await screen.findByRole('combobox');

    await user.clear(input);
    await user.type(input, 'zzz');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows the load error on the search field', async () => {
    getCoinbaseProducts.mockRejectedValue(new Error('Coinbase products request failed: 500'));
    renderDialog();
    expect(await screen.findByText('Coinbase products request failed: 500')).toBeInTheDocument();
  });
});
