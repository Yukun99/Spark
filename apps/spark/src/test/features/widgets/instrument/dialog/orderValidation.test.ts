import { validateAmount } from '@/features/widgets/instrument/dialog/orderValidation';

describe('validateAmount', () => {
  it('accepts positive numbers with up to eight decimals', () => {
    expect(validateAmount('1')).toBeNull();
    expect(validateAmount('0.00000001')).toBeNull();
    expect(validateAmount(' 77280.5 ')).toBeNull();
  });

  it('rejects blanks, non-numbers, zero or negatives, and too many decimals', () => {
    expect(validateAmount('')).toBe('Required');
    expect(validateAmount('abc')).toBe('Enter a number');
    expect(validateAmount('-1')).toBe('Enter a number');
    expect(validateAmount('1e3')).toBe('Enter a number');
    expect(validateAmount('0')).toBe('Must be greater than 0');
    expect(validateAmount('0.000000001')).toBe('At most 8 decimal places');
  });
});
