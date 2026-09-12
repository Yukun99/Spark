import { lazy, Suspense, type ComponentType } from 'react';

export type ComponentLoader<P> = () => Promise<ComponentType<P>>;

/** Loads the component's module on first render and renders nothing until it arrives. */
export const lazyComponent = <P extends object>(load: ComponentLoader<P>) => {
  const Lazy = lazy(async () => ({ default: await load() }));
  // noinspection UnnecessaryLocalVariableJS
  const LazyComponent = (props: P) => (
    <Suspense fallback={null}>
      <Lazy {...props} />
    </Suspense>
  );
  return LazyComponent;
};