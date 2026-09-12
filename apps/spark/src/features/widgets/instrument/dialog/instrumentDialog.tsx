import { ClearButton } from '@/components/buttons/clearButton';
import type { TradeSide } from '@/connections/coinbase';
import { DetailFields } from '@/features/widgets/instrument/dialog/detailFields';
import { useInstrumentDialog } from '@/features/widgets/instrument/dialog/hooks/useInstrumentDialog';
import { TradeButtons } from '@/features/widgets/instrument/tradeButtons';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import { gray } from '@/styles/palette';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';

export type InstrumentDialogProps = {
  productId: string;
  onTrade: (side: TradeSide) => void;
  onClose: () => void;
};

const COLUMNS = 3;

/** Mounted only while open; the feed streams just this product for as long as it is mounted. */
export const InstrumentDialog = ({ productId, onTrade, onClose }: InstrumentDialogProps) => {
  const { updatedAt, sections } = useInstrumentDialog(productId);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          'aria-label': `${productId} details`,
          sx: { width: '50vw', m: 0, p: 3, display: 'flex', flexDirection: 'column' },
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <WidgetLabel caption={`Last Refresh: ${updatedAt}`}>{productId}</WidgetLabel>
          <TradeButtons onTrade={onTrade} sx={{ mb: 1 }} />
        </Box>
        <ClearButton
          rounded
          aria-label='Close details'
          onClick={onClose}
          sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}
        >
          <CloseIcon />
        </ClearButton>
      </Box>
      <Divider sx={{ borderColor: gray[50] }} />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <DetailFields sections={sections} columns={COLUMNS} />
      </Box>
    </Dialog>
  );
};
