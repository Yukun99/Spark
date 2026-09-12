import { ClearButton } from '@/components/buttons/clearButton';
import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { useInstrumentDialog } from '@/features/widgets/instrument/dialog/hooks/useInstrumentDialog';
import { TradeButtons } from '@/features/widgets/instrument/tradeButtons';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import { gray } from '@/styles/palette';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';

export type InstrumentDialogProps = {
  productId: string;
  onClose: () => void;
};

const FIELD_FONT_PX = 14;
const FIELD_WIDTH = `${100 / 3}%`;
const FIELD_HEIGHT_PX = 60;
const LABEL_OPACITY = 0.6;

const divider = <Divider sx={{ borderColor: gray[50] }} />;

/** Mounted only while open; the feed streams just this product for as long as it is mounted. */
export const InstrumentDialog = ({ productId, onClose }: InstrumentDialogProps) => {
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
          <TradeButtons sx={{ mb: 1 }} />
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
      {divider}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && divider}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', py: 2 }}>
              {section.fields.map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    width: FIELD_WIDTH,
                    height: FIELD_HEIGHT_PX,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: FIELD_FONT_PX, lineHeight: 1, opacity: LABEL_OPACITY }}
                  >
                    {field.label}
                  </Typography>
                  {'side' in field ? (
                    <TransactionTypeDisplay
                      side={field.side}
                      fontSize={FIELD_FONT_PX}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: FIELD_FONT_PX,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {field.value}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Fragment>
        ))}
      </Box>
    </Dialog>
  );
};