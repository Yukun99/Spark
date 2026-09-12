import { ClearButton } from '@/components/buttons/clearButton';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import AddIcon from '@mui/icons-material/Add';

export const AddWidgetButton = () => {
  const { addWidget } = useWidgets();

  return (
    <ClearButton rounded onClick={addWidget} aria-label='Add widget' sx={{ p: 1 }}>
      <AddIcon />
    </ClearButton>
  );
};
