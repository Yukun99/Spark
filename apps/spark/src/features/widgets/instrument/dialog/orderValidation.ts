export const MAX_DECIMALS = 8;

const NUMBER_PATTERN = /^\d*\.?\d*$/;

/** Error text for a typed price or size, or null when it is a positive number with sane precision. */
export const validateAmount = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '') return 'Required';
  if (!NUMBER_PATTERN.test(trimmed) || Number.isNaN(Number(trimmed))) return 'Enter a number';
  if (Number(trimmed) <= 0) return 'Must be greater than 0';
  const decimals = trimmed.split('.')[1]?.length ?? 0;
  if (decimals > MAX_DECIMALS) return `At most ${MAX_DECIMALS} decimal places`;
  return null;
};
