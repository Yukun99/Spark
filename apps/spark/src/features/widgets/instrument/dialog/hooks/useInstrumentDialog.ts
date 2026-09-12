import { useCoinbaseFocus } from '@/connections/hooks/useCoinbaseFocus';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import {
  buildSections,
  type DetailSection,
} from '@/features/widgets/instrument/dialog/detailSections';
import { formatUpdatedAt } from '@/features/widgets/instrument/tickerFormat';
import { useMemo } from 'react';

export type UseInstrumentDialogResult = {
  updatedAt: string;
  sections: DetailSection[];
};

/** Live details for one product; while mounted, the feed only streams that product. */
export const useInstrumentDialog = (productId: string): UseInstrumentDialogResult => {
  const ticker = useCoinbaseTicker(productId);

  useCoinbaseFocus(productId);

  const sections = useMemo(() => buildSections(ticker), [ticker]);

  return { updatedAt: formatUpdatedAt(ticker), sections };
};
