import { BaseButton, type BaseButtonProps } from '@/components/buttons/baseButton';

export type FilledButtonProps = Omit<BaseButtonProps, 'variant'>;

export const FilledButton = (props: FilledButtonProps) => <BaseButton variant='contained' {...props} />;
