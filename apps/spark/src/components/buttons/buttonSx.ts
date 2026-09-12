import type { SxProps, Theme } from '@mui/material/styles';

export type ButtonShapeParams = {
  rounded?: boolean;
  sx?: SxProps<Theme>;
};

export const buttonSx = ({ rounded, sx }: ButtonShapeParams): SxProps<Theme> => [
  ...(rounded ? [{ borderRadius: '999px' }] : []),
  ...(Array.isArray(sx) ? sx : [sx]),
];