import { lazyComponent, type ComponentLoader } from '@/common/components/lazyComponent';
import { useState } from 'react';

/**
 * `lazyComponent` for dialogs driven by `open`: nothing loads until the first open, and the
 * dialog stays mounted afterwards so its exit transition still plays.
 */
export const lazyDialog = <P extends { open: boolean }>(load: ComponentLoader<P>) => {
  const Lazy = lazyComponent(load);
  // noinspection UnnecessaryLocalVariableJS
  const LazyDialog = (props: P) => {
    const [opened, setOpened] = useState(props.open);
    if (props.open && !opened) setOpened(true);
    return opened ? <Lazy {...props} /> : null;
  };
  return LazyDialog;
};