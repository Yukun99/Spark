import { lazyComponent } from '@/components/lazyComponent';
import type { WatchlistDialogProps } from '@/features/widgets/watchlist/dialog/watchlistDialog';

/** Loads on first open, keeping the dialog's form controls out of the initial bundle. */
export const LazyWatchlistDialog = lazyComponent<WatchlistDialogProps>(() =>
  import('@/features/widgets/watchlist/dialog/watchlistDialog').then(
    (module) => module.WatchlistDialog,
  ),
);
