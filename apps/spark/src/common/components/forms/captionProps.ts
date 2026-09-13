import { gray, status } from '@/styles/palette';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

export const CAPTION_FONT_PX = 10;
export const CAPTION_LINE_PX = 15;
export const CAPTION_GAP_PX = 3;
/** Height every field reserves under it so a caption or error never shifts the rows below. */
export const CAPTION_BLOCK_PX = CAPTION_LINE_PX + CAPTION_GAP_PX;

export type CaptionSlotProps = {
  formHelperText: { sx: (theme: Theme) => SystemStyleObject<Theme> };
};

/** `slotProps` for a caption under a field: gray for hints, red for errors; always rendered. */
export const captionProps = (error: string | null): CaptionSlotProps => ({
  formHelperText: {
    sx: (theme) => ({
      fontSize: CAPTION_FONT_PX,
      lineHeight: `${CAPTION_LINE_PX}px`,
      mt: `${CAPTION_GAP_PX}px`,
      mx: 0,
      color: error === null ? gray[50] : status.error.light,
      ...theme.applyStyles('dark', { color: error === null ? gray[50] : status.error.dark }),
    }),
  },
});
