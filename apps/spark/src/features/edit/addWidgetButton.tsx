import { ClearButton } from '@/common/components/buttons/clearButton';
import { useSpawnDrag } from '@/features/edit/hooks/useSpawnDrag';
import { SpawnGhost } from '@/features/edit/spawnGhost';
import { HelpTooltip } from '@/features/edit/helpTooltip';
import { WidgetTypeIcon } from '@/features/edit/widgetTypeIcon';
import type { WidgetType } from '@/features/widgets/widgetSizes';

export type AddWidgetButtonProps = {
  type: WidgetType;
};

const HELP: Record<WidgetType, { name: string; description: string }> = {
  instrument: { name: 'Instrument', description: 'Live tracker for single instrument' },
  watchlist: { name: 'Watchlist', description: 'Live tracker for multiple instruments' },
  orders: { name: 'Orders', description: 'Live tracker for placed order statuses' },
};

const helpLines = (name: string, description: string) => [
  description,
  `Click: adds ${name.toLowerCase()} widget at the first free spot on the grid.`,
  'Drag: pulls a ghost of the widget onto the grid and drops it where you release.',
];

/** Click to add at the first free spot, or press and drag onto the grid to place directly. */
export const AddWidgetButton = ({ type }: AddWidgetButtonProps) => {
  const { ghost, handlers } = useSpawnDrag({ type });

  const { name, description } = HELP[type];

  return (
    <>
      <HelpTooltip title={`${name} Widget`} lines={helpLines(name, description)}>
        <ClearButton
          rounded
          aria-label={`Add ${name.toLowerCase()} widget`}
          {...handlers}
          sx={{ p: 1, touchAction: 'none', userSelect: 'none' }}
        >
          <WidgetTypeIcon type={type} />
        </ClearButton>
      </HelpTooltip>
      {ghost && <SpawnGhost ghost={ghost} />}
    </>
  );
};
