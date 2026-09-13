import type { SxProps, Theme } from '@mui/material/styles';

export type ButtonShapeParams = {
  rounded?: boolean;
  labelled?: boolean;
  sx?: SxProps<Theme>;
};

export const buttonSx = ({ rounded, labelled, sx }: ButtonShapeParams): SxProps<Theme> => [
  ...(rounded ? [{ borderRadius: '999px' }] : []),
  ...(labelled ? [{ flexDirection: 'column' as const }] : []),
  ...(Array.isArray(sx) ? sx : [sx]),
];
