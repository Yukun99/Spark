import { COINBASE_PROVIDER, type Ticker, type TradeSide } from '@/connections/coinbase';
import { useCoinbaseFocus } from '@/connections/hooks/useCoinbaseFocus';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { validateAmount } from '@/features/widgets/instrument/dialog/orderValidation';
import { formatPrice, tickerTime } from '@/features/widgets/instrument/tickerFormat';
import { useOrders } from '@/hooks/useOrders';
import type { OrderType, TimeInForce } from '@/store/ordersSlice';
import { useCallback, useState } from 'react';

export type UsePlaceOrderDialogParams = {
  productId: string;
  side: TradeSide;
  onClose: () => void;
};

export type UsePlaceOrderDialogResult = {
  side: TradeSide;
  setSide: (side: TradeSide) => void;
  type: OrderType;
  setType: (type: OrderType) => void;
  timeInForce: TimeInForce;
  setTimeInForce: (timeInForce: TimeInForce) => void;
  /** Live bid/ask while the order is a market order; the typed price otherwise. */
  price: string;
  setPrice: (price: string) => void;
  size: string;
  setSize: (size: string) => void;
  /** Shown once the field has been edited; null while valid or untouched. */
  priceError: string | null;
  sizeError: string | null;
  estimatedValue: string;
  provider: string;
  canConfirm: boolean;
  confirm: () => void;
};

/** Ask for buys, bid for sells: the side of the book the order would hit. */
const sidePrice = (ticker: Ticker | undefined, side: TradeSide) =>
  ticker === undefined ? '' : String(side === 'buy' ? ticker.ask : ticker.bid);

export const usePlaceOrderDialog = ({
  productId,
  side: initialSide,
  onClose,
}: UsePlaceOrderDialogParams): UsePlaceOrderDialogResult => {
  const ticker = useCoinbaseTicker(productId);
  useCoinbaseFocus(productId);
  const { placeOrder } = useOrders();
  const [side, setSideState] = useState(initialSide);
  const [type, setTypeState] = useState<OrderType>('market');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('GTC');
  const [limitPrice, setLimitPrice] = useState(() => sidePrice(ticker, initialSide));
  const [size, setSizeState] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);
  const [sizeTouched, setSizeTouched] = useState(false);

  const setSide = useCallback(
    (next: TradeSide) => {
      setSideState(next);
      setLimitPrice(sidePrice(ticker, next));
    },
    [ticker],
  );
  /** Switching to a limit order starts from the price the market order was showing. */
  const setType = useCallback(
    (next: OrderType) => {
      setTypeState(next);
      if (next === 'limit') setLimitPrice(sidePrice(ticker, side));
    },
    [side, ticker],
  );
  const setPrice = useCallback((next: string) => {
    setPriceTouched(true);
    setLimitPrice(next);
  }, []);
  const setSize = useCallback((next: string) => {
    setSizeTouched(true);
    setSizeState(next);
  }, []);

  const price = type === 'market' ? sidePrice(ticker, side) : limitPrice;
  const priceInvalid = validateAmount(price);
  const sizeInvalid = validateAmount(size);
  const canConfirm = priceInvalid === null && sizeInvalid === null;
  const value = Number(price) * Number(size);
  const estimatedValue = formatPrice(canConfirm ? value : undefined);

  const confirm = useCallback(() => {
    if (!canConfirm) return;
    placeOrder({
      productId,
      side,
      type,
      timeInForce,
      price: Number(price),
      size: Number(size),
      provider: COINBASE_PROVIDER,
      priceAt: tickerTime(ticker),
    });
    onClose();
  }, [canConfirm, onClose, placeOrder, price, productId, side, size, ticker, timeInForce, type]);

  return {
    side,
    setSide,
    type,
    setType,
    timeInForce,
    setTimeInForce,
    price,
    setPrice,
    size,
    setSize,
    priceError: priceTouched ? priceInvalid : null,
    sizeError: sizeTouched ? sizeInvalid : null,
    estimatedValue,
    provider: COINBASE_PROVIDER,
    canConfirm,
    confirm,
  };
};
