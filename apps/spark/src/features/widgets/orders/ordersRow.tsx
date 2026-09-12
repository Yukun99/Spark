import { ClearButton } from '@/components/buttons/clearButton';
import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import type { OrderRow } from '@/features/widgets/orders/hooks/useOrdersWidget';
import { STRIP_TEXT_PX, stripHeadingSx, ValueStrip } from '@/features/widgets/valueStrip';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type OrdersRowProps = {
  row: OrderRow;
};

/**
 * Parent grid columns shared by the header and every row:
 * type | status | price | fulfilment | timestamp | actions.
 * Type and actions hug their content; the rest share whatever width is left.
 */
export const ORDERS_COLUMNS = 'auto repeat(4, 1fr) auto';

/** Subgrid row spanning every parent column. */
const rowSx = {
  display: 'grid',
  gridColumn: '1 / -1',
  gridTemplateColumns: 'subgrid',
  alignItems: 'center',
  columnGap: 4,
} as const;

const cellSx = { fontSize: STRIP_TEXT_PX, whiteSpace: 'nowrap' } as const;

const ACTION_BUTTON_PX = STRIP_TEXT_PX * 1.5;
const actionButtonSx = { p: 0, width: ACTION_BUTTON_PX, height: ACTION_BUTTON_PX } as const;
const actionIconSx = { fontSize: STRIP_TEXT_PX + 2 } as const;

type ActionButtonProps = { label: string; children: ReactNode };

const ActionButton = ({ label, children }: ActionButtonProps) => (
  <ClearButton rounded aria-label={label} sx={actionButtonSx}>
    {children}
  </ClearButton>
);

const HEADINGS = ['Txn Type', 'Status', 'Price', 'Fulfilment', 'Timestamp', 'Actions'] as const;

/** Column titles above the order rows, padded like a row so they line up with its cells. */
export const OrdersHeader = () => (
  <Box sx={{ ...rowSx, px: 1 }}>
    {HEADINGS.map((heading) => (
      <Typography key={heading} sx={stripHeadingSx}>
        {heading}
      </Typography>
    ))}
  </Box>
);

/** One order on a tinted strip; its cells sit on the parent grid so columns line up. */
export const OrdersRow = ({ row }: OrdersRowProps) => (
  <ValueStrip data-testid='order-row' sx={rowSx}>
    <TransactionTypeDisplay side={row.side} sx={{ justifySelf: 'start' }} />
    <Typography sx={cellSx}>{row.status}</Typography>
    <Typography sx={cellSx}>{row.price}</Typography>
    <Typography sx={cellSx}>{row.fulfilment}</Typography>
    <Typography sx={cellSx}>{row.timestamp}</Typography>
    <Stack direction='row' spacing={0.5} data-testid='order-actions'>
      <ActionButton label='Copy order'>
        <ContentCopyIcon sx={actionIconSx} />
      </ActionButton>
      <ActionButton label='Modify order'>
        <EditIcon sx={actionIconSx} />
      </ActionButton>
      <ActionButton label='Cancel order'>
        <CloseIcon sx={actionIconSx} />
      </ActionButton>
    </Stack>
  </ValueStrip>
);
