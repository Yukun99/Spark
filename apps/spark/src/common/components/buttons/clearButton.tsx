import { BaseButton, type BaseButtonProps } from '@/common/components/buttons/baseButton';

export type ClearButtonProps = Omit<BaseButtonProps, 'variant'>;

export const ClearButton = (props: ClearButtonProps) => <BaseButton variant='text' {...props} />;
