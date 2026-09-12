const fillFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/** Completion of an order as a percentage to 2 d.p., e.g. `37.50%`. */
export const formatFill = (filledSize: number, size: number) =>
  size > 0 ? fillFormat.format(filledSize / size) : fillFormat.format(0);

/** Date and time an order was placed, e.g. `12/09/2026, 09:01:00`. */
export const formatDateTime = (value: number) => dateTimeFormat.format(value);
