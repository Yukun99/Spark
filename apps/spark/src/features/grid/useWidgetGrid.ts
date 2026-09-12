import type { WidgetLayout } from '@/features/grid/gridWidget';
import { getEmptyCells, type GridCell } from '@/features/grid/gridOccupancy';
import { Children, isValidElement, useMemo, type ReactNode } from 'react';

const hasLayout = (props: unknown): props is { layout: WidgetLayout } =>
  typeof props === 'object' && props !== null && 'layout' in props;

export type UseWidgetGridResult = {
  emptyCells: GridCell[];
};

export const useWidgetGrid = (children: ReactNode): UseWidgetGridResult => {
  const emptyCells = useMemo(() => {
    const layouts = Children.toArray(children)
      .filter(isValidElement)
      .map((child) => child.props)
      .filter(hasLayout)
      .map(({ layout }) => layout);
    return getEmptyCells(layouts);
  }, [children]);

  return { emptyCells };
};
