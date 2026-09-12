import { TILE_GAP_PX, TILE_RADIUS_PX } from '@/features/grid/gridConfig';
import type { SpawnGhost as SpawnGhostModel } from '@/features/edit/hooks/useSpawnDrag';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';
import { createPortal } from 'react-dom';

export type SpawnGhostProps = {
  ghost: SpawnGhostModel;
};

const GHOST_OPACITY = 0.85;

/** Translucent card that follows the pointer while a new widget is dragged onto the grid. */
export const SpawnGhost = ({ ghost }: SpawnGhostProps) =>
  createPortal(
    <Box
      data-testid='spawn-ghost'
      sx={(theme) => ({
        position: 'fixed',
        ...ghost,
        pointerEvents: 'none',
        zIndex: theme.zIndex.tooltip,
      })}
    >
      <Box
        sx={[
          shadowSx('md'),
          (theme) => ({
            position: 'absolute',
            inset: TILE_GAP_PX,
            borderRadius: `${TILE_RADIUS_PX}px`,
            opacity: GHOST_OPACITY,
            bgcolor: colours.cream,
            ...theme.applyStyles('dark', { bgcolor: colours.navy }),
          }),
        ]}
      />
    </Box>,
    document.body,
  );
