import { ClearButton } from '@/components/buttons/clearButton';
import { useUpdateInterval } from '@/hooks/useUpdateInterval';
import TimerIcon from '@mui/icons-material/Timer';

export const UpdateIntervalButton = () => {
  const { updateIntervalLabel, cycleUpdateInterval } = useUpdateInterval();

  return (
    <ClearButton
      rounded
      label={updateIntervalLabel}
      onClick={cycleUpdateInterval}
      aria-label={`Change refresh interval, currently ${updateIntervalLabel}`}
      sx={{ p: 1 }}
    >
      <TimerIcon />
    </ClearButton>
  );
};
