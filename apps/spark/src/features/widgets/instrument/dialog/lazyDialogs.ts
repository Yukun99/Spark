import { lazyComponent } from '@/common/components/lazyComponent';
import type { InstrumentDialogProps } from '@/features/widgets/instrument/dialog/instrumentDialog';
import type { InstrumentSearchDialogProps } from '@/features/widgets/instrument/dialog/instrumentSearchDialog';
import type { PlaceOrderDialogProps } from '@/features/widgets/instrument/dialog/placeOrderDialog';

/** Dialog modules load on first open, keeping their form controls out of the initial bundle. */
export const LazyInstrumentDialog = lazyComponent<InstrumentDialogProps>(() =>
  import('@/features/widgets/instrument/dialog/instrumentDialog').then(
    (module) => module.InstrumentDialog,
  ),
);

export const LazyInstrumentSearchDialog = lazyComponent<InstrumentSearchDialogProps>(() =>
  import('@/features/widgets/instrument/dialog/instrumentSearchDialog').then(
    (module) => module.InstrumentSearchDialog,
  ),
);

export const LazyPlaceOrderDialog = lazyComponent<PlaceOrderDialogProps>(() =>
  import('@/features/widgets/instrument/dialog/placeOrderDialog').then(
    (module) => module.PlaceOrderDialog,
  ),
);
