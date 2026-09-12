const fillFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Completion of an order as a percentage to 2 d.p., e.g. `37.50%`. */
export const formatFill = (filledSize: number, size: number) =>
  size > 0 ? fillFormat.format(filledSize / size) : fillFormat.format(0);
