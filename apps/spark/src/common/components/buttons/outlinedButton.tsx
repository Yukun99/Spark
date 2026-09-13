import { BaseButton, type BaseButtonProps } from '@/common/components/buttons/baseButton';

export type OutlinedButtonProps = Omit<BaseButtonProps, 'variant'>;

export const OutlinedButton = (props: OutlinedButtonProps) => <BaseButton variant='outlined' {...props} />;
