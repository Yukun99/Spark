import { ClearButton } from '@/components/buttons/clearButton';
import { useStreaming } from '@/hooks/useStreaming';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const StreamingButton = () => {
  const { streaming, toggleStreaming } = useStreaming();

  return (
    <ClearButton
      rounded
      onClick={toggleStreaming}
      aria-label={streaming ? 'Pause streaming' : 'Resume streaming'}
      aria-pressed={!streaming}
      sx={{ p: 1 }}
    >
      {streaming ? <PauseIcon /> : <PlayArrowIcon />}
    </ClearButton>
  );
};
