import { ClearButton } from '@/components/buttons/clearButton';
import { HelpTooltip } from '@/features/edit/helpTooltip';
import { useStreaming } from '@/hooks/useStreaming';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const HELP_LINES = [
  'This button allows you to toggle live updates for instrument data on or off.',
];

export const StreamingButton = () => {
  const { streaming, toggleStreaming } = useStreaming();

  return (
    <HelpTooltip title='Play / Pause Updates' lines={HELP_LINES}>
      <ClearButton
        rounded
        onClick={toggleStreaming}
        aria-label={streaming ? 'Pause streaming' : 'Resume streaming'}
        aria-pressed={!streaming}
        sx={{ p: 1 }}
      >
        {streaming ? <PauseIcon /> : <PlayArrowIcon />}
      </ClearButton>
    </HelpTooltip>
  );
};
