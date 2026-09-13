import { ClearButton } from '@/components/buttons/clearButton';
import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import type { OrderRow } from '@/features/widgets/orders/hooks/useOrdersWidget';
import { STRIP_TEXT_PX, stripHeadingSx, ValueChip, ValueStrip } from '@/features/widgets/valueStrip';
import { theme as colours, gray } from '@/styles/palette';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type OrdersRowProps = {
  row: OrderRow;
  onCopy: (row: OrderRow) => void;
  onEdit: (row: OrderRow) => void;
  onCancel: (row: OrderRow) => void;
};

/**
 * Parent grid columns shared by the header and every row:
 * instrument | status | price | fulfilment | submission time | actions.
 * Actions hug their buttons; the rest share the width in proportion to their widest values.
 */
export const ORDERS_COLUMNS = '9fr 20fr 7fr 13fr 13fr auto';

/** Subgrid row spanning every parent column. */
const rowSx = {
  display: 'grid',
  gridColumn: '1 / -1',
  gridTemplateColumns: 'subgrid',
  alignItems: 'center',
  columnGap: 4,
} as const;

/** Cells sit above the glow overlay so the wash only tints the strip behind them. */
const cellSx = { fontSize: STRIP_TEXT_PX, whiteSpace: 'nowrap', position: 'relative' } as const;
const chipSx = { ...cellSx, justifySelf: 'start' } as const;

const FILL_BAR_PX = 3;

/** Space between the lines of a multi-line table cell, in px. */
const MULTILINE_GAP_PX = 8;

/** Two-line cell: stacks its children with the shared multi-line gap. */
const multilineCellSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${MULTILINE_GAP_PX}px`,
  minWidth: 0,
  position: 'relative',
} as const;

type FillBarProps = { fraction: number };

/** Thin track in the opposite theme colour with the filled share in the card colour. */
const FillBar = ({ fraction }: FillBarProps) => (
  <Box
    role='progressbar'
    aria-valuenow={Math.round(fraction * 100)}
    sx={(theme) => ({
      height: FILL_BAR_PX,
      borderRadius: FILL_BAR_PX / 2,
      overflow: 'hidden',
      bgcolor: colours.navy,
      ...theme.applyStyles('dark', { bgcolor: colours.cream }),
    })}
  >
    <Box
      sx={(theme) => ({
        height: FILL_BAR_PX,
        borderRadius: FILL_BAR_PX / 2,
        width: `${fraction * 100}%`,
        bgcolor: colours.cream,
        ...theme.applyStyles('dark', { bgcolor: colours.navy }),
      })}
    />
  </Box>
);

const ACTION_BUTTON_PX = STRIP_TEXT_PX * 1.5;
const actionButtonSx = { p: 0, width: ACTION_BUTTON_PX, height: ACTION_BUTTON_PX } as const;
const actionIconSx = { fontSize: STRIP_TEXT_PX + 2 } as const;

type ActionButtonProps = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

const ActionButton = ({ label, disabled, onClick, children }: ActionButtonProps) => (
  <ClearButton aria-label={label} disabled={disabled} onClick={onClick} sx={actionButtonSx}>
    {children}
  </ClearButton>
);

const HEADINGS = ['Instrument', 'Status', 'Price', 'Fulfilment', 'Submission Time', 'Actions'] as const;

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
export const OrdersRow = ({ row, onCopy, onEdit, onCancel }: OrdersRowProps) => (
  <ValueStrip data-testid='order-row' sx={{ ...rowSx, position: 'relative', overflow: 'hidden' }}>
    {row.glowAt !== undefined && <FreshnessGlow tickAt={row.glowAt} />}
    <ValueChip sx={chipSx}>{row.instrument}</ValueChip>
    <Box sx={multilineCellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TransactionTypeDisplay side={row.side} />
        <Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />
        <ValueChip sx={cellSx}>{row.status}</ValueChip>
        <ValueChip sx={{ ...cellSx, ml: 'auto' }}>{row.fillLabel}</ValueChip>
      </Box>
      <FillBar fraction={row.fill} />
    </Box>
    <Box sx={{ ...multilineCellSx, alignItems: 'start' }}>
      <ValueChip sx={cellSx}>{row.type}</ValueChip>
      <ValueChip sx={cellSx}>{row.price}</ValueChip>
    </Box>
    <Box sx={{ ...multilineCellSx, alignItems: 'start' }}>
      <ValueChip sx={cellSx}>{row.provider}</ValueChip>
      <ValueChip sx={cellSx}>{row.fulfilment}</ValueChip>
    </Box>
    <ValueChip sx={chipSx}>{row.timestamp}</ValueChip>
    <Stack
      direction='row'
      spacing={0.5}
      divider={<Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />}
      data-testid='order-actions'
      sx={{ position: 'relative' }}
    >
      <ActionButton label='Copy order' onClick={() => onCopy(row)}>
        <ContentCopyIcon sx={actionIconSx} />
      </ActionButton>
      <ActionButton label='Modify order' disabled={!row.open} onClick={() => onEdit(row)}>
        <EditIcon sx={actionIconSx} />
      </ActionButton>
      <ActionButton label='Cancel order' disabled={!row.open} onClick={() => onCancel(row)}>
        <CloseIcon sx={actionIconSx} />
      </ActionButton>
    </Stack>
  </ValueStrip>
);
