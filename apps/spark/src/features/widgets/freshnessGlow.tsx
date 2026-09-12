import { glow } from '@/styles/palette';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { Ref } from 'react';

export type FreshnessGlowProps = {
  /** Re-keys the wash so it restarts on every change; omit when driving it via `restartGlow`. */
  tickAt?: number;
  ref?: Ref<HTMLDivElement>;
  hidden?: boolean;
};

export const GLOW_FADE_MS = 2000;

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const FADE_KEYFRAMES = [{ opacity: 1 }, { opacity: 0 }];
const FADE_OPTIONS: KeyframeAnimationOptions = {
  duration: GLOW_FADE_MS,
  easing: 'ease-out',
  fill: 'forwards',
};
const fades = new WeakMap<HTMLElement, Animation>();

/**
 * Restarts a mounted glow's fade in place through the Web Animations API, which needs no style
 * flush, unlike reading the CSS animation back. jsdom has no `animate`, hence the guard.
 */
export const restartGlow = (el: HTMLElement) => {
  if (typeof el.animate !== 'function') return;
  fades.get(el)?.cancel();
  fades.set(el, el.animate(FADE_KEYFRAMES, FADE_OPTIONS));
};

/** Purple wash over a widget that restarts on every tick and fades out while no new tick arrives. */
export const FreshnessGlow = ({ tickAt, ref, hidden }: FreshnessGlowProps) => (
  <Box
    key={tickAt}
    ref={ref}
    hidden={hidden}
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
