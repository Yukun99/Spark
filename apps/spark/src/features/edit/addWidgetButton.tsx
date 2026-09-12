import { ClearButton } from '@/components/buttons/clearButton';
import { useSpawnDrag } from '@/features/edit/hooks/useSpawnDrag';
import { SpawnGhost } from '@/features/edit/spawnGhost';
import type { WidgetType } from '@/features/widgets/widgetSizes';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import type { ReactElement } from 'react';

export type AddWidgetButtonProps = {
  type: WidgetType;
};

const ICONS: Record<WidgetType, { label: string; icon: ReactElement }> = {
  instrument: { label: 'Add instrument widget', icon: <ShowChartIcon /> },
  watchlist: { label: 'Add watchlist widget', icon: <ViewListIcon /> },
};

/** Click to add at the first free spot, or press and drag onto the grid to place directly. */
export const AddWidgetButton = ({ type }: AddWidgetButtonProps) => {
  const { ghost, handlers } = useSpawnDrag({ type });
  const { label, icon } = ICONS[type];

  return (
    <>
      <ClearButton
        rounded
        aria-label={label}
        {...handlers}
        sx={{ p: 1, touchAction: 'none', userSelect: 'none' }}
      >
        {icon}
      </ClearButton>
      {ghost && <SpawnGhost ghost={ghost} />}
    </>
  );
};
