import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { formatPrice } from '@/features/widgets/instrument/tickerFormat';
import Typography from '@mui/material/Typography';

export type WatchlistRowProps = {
  productId: string;
};

const TEXT_PX = 12;

export const WatchlistRow = ({ productId }: WatchlistRowProps) => {
  const ticker = useCoinbaseTicker(productId);

  return (
    <Typography data-testid='watchlist-row' sx={{ fontSize: TEXT_PX, py: 0.5 }}>
      {productId} {formatPrice(ticker?.bid)} / {formatPrice(ticker?.ask)}
    </Typography>
  );
};
