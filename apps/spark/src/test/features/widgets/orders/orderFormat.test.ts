import { formatFill } from '@/features/widgets/orders/orderFormat';

describe('formatFill', () => {
  it('shows completion to two decimal places', () => {
    expect(formatFill(0, 25)).toBe('0.00%');
    expect(formatFill(0.75, 2)).toBe('37.50%');
    expect(formatFill(1234.5678, 5000)).toBe('24.69%');
    expect(formatFill(40, 40)).toBe('100.00%');
    expect(formatFill(0, 0)).toBe('0.00%');
  });
});
