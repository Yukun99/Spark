import type { ConfirmDialogProps } from '@/common/components/dialogs/confirmDialog';
import { lazyDialog } from '@/common/components/dialogs/lazyDialog';

/** `ConfirmDialog` whose module (MUI Dialog and friends) loads on first open. */
export const LazyConfirmDialog = lazyDialog<ConfirmDialogProps>(() =>
  import('@/common/components/dialogs/confirmDialog').then((module) => module.ConfirmDialog),
);
