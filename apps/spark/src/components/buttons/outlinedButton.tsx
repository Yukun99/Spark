import { buttonSx } from '@/components/buttons/buttonSx';
import Button, { type ButtonProps } from '@mui/material/Button';

export type OutlinedButtonProps = Omit<ButtonProps, 'variant'> & { rounded?: boolean };

export const OutlinedButton = ({ rounded, sx, ...props }: OutlinedButtonProps) => (
  <Button variant='outlined' sx={buttonSx({ rounded, sx })} {...props} />
);