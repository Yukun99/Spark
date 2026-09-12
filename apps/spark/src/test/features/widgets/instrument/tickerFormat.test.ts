import { formatCompactSize, formatSize } from '@/features/widgets/instrument/tickerFormat';

describe('formatCompactSize', () => {
  it('keeps up to 8 decimals while the integer part has at most 3 digits', () => {
    expect(formatCompactSize(0.00000639)).toBe('0.00000639');
    expect(formatCompactSize(999.00000001)).toBe('999.00000001');
    expect(formatCompactSize(0.5)).toBe('0.5');
  });

  it('truncates decimals past 11 total digits without rounding up', () => {
    expect(formatCompactSize(9999.00000001)).toBe('9,999');
    expect(formatCompactSize(9999.12345678)).toBe('9,999.1234567');
    expect(formatCompactSize(9999.99999999)).toBe('9,999.9999999');
    expect(formatCompactSize(123456789012.99)).toBe('123,456,789,012');
    expect(formatSize(9999.12345678)).toBe('9,999.12345678');
  });

  it('shows a placeholder for missing values', () => {
    expect(formatCompactSize(undefined)).toBe('--');
    expect(formatCompactSize(0)).toBe('0');
  });
});
