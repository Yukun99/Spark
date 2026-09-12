import { ClearButton } from '@/components/buttons/clearButton';
import { HelpTooltip } from '@/features/edit/helpTooltip';
import { useEditMode } from '@/hooks/useEditMode';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const HELP_WIDTH_PX = 500;
const HELP_LINES = [
  'This mode allows you to modify the number and layout of widgets displayed. You may modify, delete, resize or move widgets around. Click on save to save changes once you are done editing.',
  'Modify: Click the modify button on a widget to modify its display values.',
  'Delete: Click the delete button on a widget to delete a widget.',
  'Drag: Drag a widget around by holding down left click, and releasing it where you want.',
  'Resize: Drag around the purple bars at the sides of the widgets to resize them.',
];

export const EditModeButton = () => {
  const { editMode, toggleEditMode } = useEditMode();

  return (
    <HelpTooltip title='Edit Mode' width={HELP_WIDTH_PX} lines={HELP_LINES}>
      <ClearButton
        rounded
        onClick={toggleEditMode}
        aria-label={editMode ? 'Save layout' : 'Enter edit mode'}
        aria-pressed={editMode}
        sx={{ p: 1 }}
      >
        {editMode ? <SaveIcon /> : <EditIcon />}
      </ClearButton>
    </HelpTooltip>
  );
};
