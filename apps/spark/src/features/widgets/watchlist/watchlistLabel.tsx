import { useCoinbaseLatestTick } from '@/connections/hooks/useCoinbaseLatestTick';
import { formatTime } from '@/features/widgets/instrument/tickerFormat';
import { WidgetLabel } from '@/features/widgets/widgetLabel';

export type WatchlistLabelProps = {
  title: string;
  productIds: string[];
};

/** Title plus the newest tick time; subscribes here so ticks re-render only this label and the rows. */
export const WatchlistLabel = ({ title, productIds }: WatchlistLabelProps) => {
  const latestTick = useCoinbaseLatestTick(productIds);

  return <WidgetLabel caption={`Last Refresh: ${formatTime(latestTick)}`}>{title}</WidgetLabel>;
};
