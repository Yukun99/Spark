import { buttonSx } from '@/common/components/buttons/buttonSx';
import { gray } from '@/styles/palette';
import Button, { type ButtonProps } from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export type ButtonExtras = { rounded?: boolean; label?: string };

export type BaseButtonProps = ButtonProps & ButtonExtras;

const LABEL_SX = { fontSize: 10, lineHeight: 1, mt: 0.5, color: gray[50] } as const;

export const BaseButton = ({ rounded, label, sx, children, ...props }: BaseButtonProps) => (
  <Button sx={buttonSx({ rounded, labelled: Boolean(label), sx })} {...props}>
    {children}
    {label && (
      <Typography component='span' sx={LABEL_SX}>
        {label}
      </Typography>
    )}
  </Button>
);
