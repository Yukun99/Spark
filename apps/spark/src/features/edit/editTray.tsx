import { AddWidgetButton } from '@/features/edit/addWidgetButton';
import { EditModeButton } from '@/features/edit/editModeButton';
import { UpdateIntervalButton } from '@/features/edit/updateIntervalButton';
import { TILE_GAP_PX } from '@/features/grid/gridConfig';
import { useEditMode } from '@/hooks/useEditMode';
import { theme as colours } from '@/styles/palette';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';

const REVEAL_MS = 200;
const EASING = 'ease-out';
/** MUI icon default size and the padding the rounded action buttons wrap it in. */
const ICON_PX = 24;
const BUTTON_PAD_PX = 8;
const BUTTON_PX = ICON_PX + 2 * BUTTON_PAD_PX;
/** Ring drawn around the save button in edit mode. */
const RING_PAD_PX = 8;
const RING_PX = BUTTON_PX + 2 * RING_PAD_PX;
/** Tray buttons use a smaller icon, so the pill hanging under the ring is narrower. */
const TRAY_ICON_PX = 20;
const TRAY_PAD_PX = RING_PAD_PX / 2;
const TRAY_PX = TRAY_ICON_PX + 2 * BUTTON_PAD_PX + 2 * TRAY_PAD_PX;
/** Tray starts at the ring's centre; buttons begin one gap below the save button. */
const TRAY_TOP_PX = BUTTON_PX / 2 + TILE_GAP_PX;

const centredSx = { position: 'absolute', left: '50%', transform: 'translateX(-50%)' } as const;

/** Card-coloured ring plus pill behind the buttons; fades as one layer so the overlap never shows. */
const backdropSx = (editMode: boolean) => (theme: Theme) => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: editMode ? 1 : 0,
  transition: `opacity ${REVEAL_MS}ms ${EASING}`,
  '& > *': {
    bgcolor: colours.cream,
    ...theme.applyStyles('dark', { bgcolor: colours.navy }),
  },
});

/**
 * Edit toggle with the widget tools hanging under it: a ring grows around the save button and a
 * pill slides out below holding the add and interval buttons, which tuck back up under the ring
 * when edit mode ends.
 */
export const EditTray = () => {
  const { editMode } = useEditMode();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: `-${RING_PAD_PX}px`,
      }}
    >
      <Box aria-hidden sx={backdropSx(editMode)}>
        <Box sx={{ ...centredSx, top: 0, width: RING_PX, height: RING_PX, borderRadius: '50%' }} />
        <Box
          sx={{
            ...centredSx,
            top: RING_PX / 2,
            bottom: 0,
            width: TRAY_PX,
            borderRadius: `0 0 ${TRAY_PX / 2}px ${TRAY_PX / 2}px`,
          }}
        />
      </Box>
      <Box sx={{ p: `${RING_PAD_PX}px`, position: 'relative' }}>
        <EditModeButton />
      </Box>
      <Collapse in={editMode} timeout={REVEAL_MS} easing={EASING} sx={{ mt: `-${RING_PX / 2}px` }}>
        <Stack
          spacing={`${TILE_GAP_PX}px`}
          sx={{
            pt: `${TRAY_TOP_PX}px`,
            pb: `${TILE_GAP_PX}px`,
            alignItems: 'center',
            '& .MuiSvgIcon-root': { fontSize: TRAY_ICON_PX },
            '& > *': {
              transformOrigin: 'top center',
              opacity: editMode ? 1 : 0,
              transform: editMode ? 'none' : `translateY(-${TRAY_TOP_PX}px) scale(0.5)`,
              transition: `opacity ${REVEAL_MS}ms ${EASING}, transform ${REVEAL_MS}ms ${EASING}`,
            },
          }}
        >
          <AddWidgetButton type='instrument' />
          <AddWidgetButton type='watchlist' />
          <AddWidgetButton type='orders' />
          <UpdateIntervalButton />
        </Stack>
      </Collapse>
    </Box>
  );
};
