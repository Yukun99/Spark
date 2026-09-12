import { BaseButton, type BaseButtonProps } from '@/components/buttons/baseButton';

export type ClearButtonProps = Omit<BaseButtonProps, 'variant'>;

export const ClearButton = (props: ClearButtonProps) => <BaseButton variant='text' {...props} />;
