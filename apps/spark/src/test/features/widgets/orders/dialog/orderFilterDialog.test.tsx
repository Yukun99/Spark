import { OrderFilterDialog } from '@/features/widgets/orders/dialog/orderFilterDialog';
import { filterFromForm, formFromFilter } from '@/features/widgets/orders/hooks/useOrderFilterDialog';
import type { OrderFilter } from '@/store/ordersSlice';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { sampleOrders } from '@/test/fixtures/orders';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const renderDialog = (initial: OrderFilter = {}) => {
  installFakeApi({ orders: sampleOrders() });
  const onApply = vi.fn();
  const onClose = vi.fn();
  render(<OrderFilterDialog initial={initial} onApply={onApply} onClose={onClose} />);
  return { onApply, onClose };
};

const field = (name: string) => screen.getByRole('textbox', { name });
const confirmButton = () => screen.getByRole('button', { name: 'Confirm' });

describe('order filter form mapping', () => {
  it('round-trips a filter through the form, dates covering whole days', () => {
    const from = dayjs('2026-09-10T15:30:00');
    const filter: OrderFilter = {
      productId: 'ETH-USD',
      side: 'sell',
      statuses: ['pending'],
      types: ['limit', 'market'],
      minPrice: 10,
      maxPrice: 20.5,
      from: from.valueOf(),
      to: from.add(2, 'day').valueOf(),
    };
    expect(filterFromForm(formFromFilter(filter))).toEqual({
      ...filter,
      from: from.startOf('day').valueOf(),
      to: from.add(2, 'day').endOf('day').valueOf(),
    });
    expect(filterFromForm(formFromFilter({}))).toEqual({});
  });
});

describe('OrderFilterDialog', () => {
  it('lists the instruments the user has ordered', async () => {
    const user = userEvent.setup();
    renderDialog();
    const instrument = screen.getByRole('combobox', { name: 'Instrument' });
    await user.click(instrument);
    await user.type(instrument, 'B');
    expect(await screen.findByRole('option', { name: 'BTC-USD' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'ETH-USD' })).not.toBeInTheDocument();
  });

  it('prefills from the active filter and clears everything with the corner button', async () => {
    const user = userEvent.setup();
    renderDialog({ side: 'buy', statuses: ['fulfilled'], types: ['market'], minPrice: 5, maxPrice: 50 });
    expect(screen.getByRole('radio', { name: 'Buy' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Fulfilled' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Market' })).toBeChecked();
    expect(field('Minimum Price')).toHaveValue('5');
    expect(field('Maximum Price')).toHaveValue('50');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('radio', { name: 'Any' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Fulfilled' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Market' })).not.toBeChecked();
    expect(field('Minimum Price')).toHaveValue('');
    expect(field('Maximum Price')).toHaveValue('');
  });

  it('blocks confirm on a bad price or inverted range, then applies only the set fields', async () => {
    const user = userEvent.setup();
    const { onApply } = renderDialog();
    await user.type(field('Minimum Price'), 'abc');
    expect(screen.getByText('Enter a number')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.clear(field('Minimum Price'));
    await user.type(field('Minimum Price'), '10');
    await user.type(field('Maximum Price'), '9');
    expect(screen.getByText('Must be at least the minimum price')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.clear(field('Maximum Price'));
    await user.click(screen.getByRole('radio', { name: 'Sell' }));
    await user.click(screen.getByRole('checkbox', { name: 'Pending' }));
    await user.click(screen.getByRole('checkbox', { name: 'Cancelled' }));
    expect(confirmButton()).toBeEnabled();
    await user.click(confirmButton());
    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    expect(onApply).toHaveBeenCalledWith({ side: 'sell', statuses: ['pending', 'cancelled'], minPrice: 10 });
  });

  it('cancels without applying', async () => {
    const user = userEvent.setup();
    const { onApply, onClose } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});
