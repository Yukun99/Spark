import { buttonSx } from '@/components/buttons/buttonSx';
import Button, { type ButtonProps } from '@mui/material/Button';

export type FilledButtonProps = Omit<ButtonProps, 'variant'> & { rounded?: boolean };

export const FilledButton = ({ rounded, sx, ...props }: FilledButtonProps) => (
  <Button variant='contained' sx={buttonSx({ rounded, sx })} {...props} />
);