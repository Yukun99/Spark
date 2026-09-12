import { glow } from '@/styles/palette';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

export type FreshnessGlowProps = {
  tickAt: number;
};

export const GLOW_FADE_MS = 2000;

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

/** Purple wash over a widget that restarts on every tick and fades out while no new tick arrives. */
export const FreshnessGlow = ({ tickAt }: FreshnessGlowProps) => (
  <Box
    key={tickAt}
    data-testid='freshness-glow'
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      bgcolor: glow.light,
      animation: `${fade} ${GLOW_FADE_MS}ms ease-out forwards`,
      ...theme.applyStyles('dark', { bgcolor: glow.dark }),
    })}
  />
);