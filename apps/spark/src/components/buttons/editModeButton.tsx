import { ClearButton } from '@/components/buttons/clearButton';
import { useEditMode } from '@/hooks/useEditMode';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';

export const EditModeButton = () => {
  const { editMode, toggleEditMode } = useEditMode();

  return (
    <ClearButton
      rounded
      onClick={toggleEditMode}
      aria-label={editMode ? 'Exit edit mode' : 'Enter edit mode'}
      aria-pressed={editMode}
      sx={{ p: 1 }}
    >
      {editMode ? <EditOffIcon /> : <EditIcon />}
    </ClearButton>
  );
};
