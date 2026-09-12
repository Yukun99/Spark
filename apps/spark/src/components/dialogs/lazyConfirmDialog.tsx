import type { ConfirmDialogProps } from '@/components/dialogs/confirmDialog';
import { lazyDialog } from '@/components/dialogs/lazyDialog';

/** `ConfirmDialog` whose module (MUI Dialog and friends) loads on first open. */
export const LazyConfirmDialog = lazyDialog<ConfirmDialogProps>(() =>
  import('@/components/dialogs/confirmDialog').then((module) => module.ConfirmDialog),
);
