import { formatDateTime, formatFill } from '@/features/widgets/orders/orderFormat';

describe('formatFill', () => {
  it('shows completion to two decimal places', () => {
    expect(formatFill(0, 25)).toBe('0.00%');
    expect(formatFill(0.75, 2)).toBe('37.50%');
    expect(formatFill(1234.5678, 5000)).toBe('24.69%');
    expect(formatFill(40, 40)).toBe('100.00%');
    expect(formatFill(0, 0)).toBe('0.00%');
  });
});

describe('formatDateTime', () => {
  it('shows the day as well as the time', () => {
    const local = new Date(2026, 8, 12, 9, 1, 0);
    expect(formatDateTime(local.getTime())).toBe('12/09/2026, 09:01:00');
  });
});
