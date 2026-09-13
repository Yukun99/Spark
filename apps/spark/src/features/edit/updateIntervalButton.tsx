import { ClearButton } from '@/common/components/buttons/clearButton';
import { HelpTooltip } from '@/features/edit/helpTooltip';
import { useUpdateInterval } from '@/common/hooks/useUpdateInterval';
import TimerIcon from '@mui/icons-material/Timer';

const HELP_LINES = ['Adjust frequency of instrument information updates.'];

export const UpdateIntervalButton = () => {
  const { updateIntervalLabel, cycleUpdateInterval } = useUpdateInterval();

  return (
    <HelpTooltip title='Update Delay' lines={HELP_LINES}>
      <ClearButton
        rounded
        label={updateIntervalLabel}
        onClick={cycleUpdateInterval}
        aria-label={`Change refresh interval, currently ${updateIntervalLabel}`}
        sx={{ p: 1 }}
      >
        <TimerIcon />
      </ClearButton>
    </HelpTooltip>
  );
};
