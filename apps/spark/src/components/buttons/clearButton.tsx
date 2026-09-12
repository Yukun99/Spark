import { buttonSx } from '@/components/buttons/buttonSx';
import Button, { type ButtonProps } from '@mui/material/Button';

export type ClearButtonProps = Omit<ButtonProps, 'variant'> & { rounded?: boolean };

export const ClearButton = ({ rounded, sx, ...props }: ClearButtonProps) => (
  <Button variant='text' sx={buttonSx({ rounded, sx })} {...props} />
);
