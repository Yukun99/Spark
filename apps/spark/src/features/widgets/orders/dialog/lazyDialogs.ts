import { lazyComponent } from '@/common/components/lazyComponent';
import type { OrderFilterDialogProps } from '@/features/widgets/orders/dialog/orderFilterDialog';

/** Loads on first open, keeping the date pickers out of the initial bundle. */
export const LazyOrderFilterDialog = lazyComponent<OrderFilterDialogProps>(() =>
  import('@/features/widgets/orders/dialog/orderFilterDialog').then(
    (module) => module.OrderFilterDialog,
  ),
);
