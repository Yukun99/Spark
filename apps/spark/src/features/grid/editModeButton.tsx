import { ClearButton } from '@/components/buttons/clearButton';
import { useEditMode } from '@/hooks/useEditMode';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export const EditModeButton = () => {
  const { editMode, toggleEditMode } = useEditMode();

  return (
    <ClearButton
      rounded
      onClick={toggleEditMode}
      aria-label={editMode ? 'Save layout' : 'Enter edit mode'}
      aria-pressed={editMode}
      sx={{ p: 1 }}
    >
      {editMode ? <SaveIcon /> : <EditIcon />}
    </ClearButton>
  );
};
