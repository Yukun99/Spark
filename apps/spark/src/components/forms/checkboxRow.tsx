import { CAPTION_BLOCK_PX } from '@/components/forms/captionProps';
import { focusLabelControl } from '@/components/forms/focusLabelControl';
import { GROUP_LABEL_PX, OPTION_LABEL_PX } from '@/components/forms/radioRow';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

export type CheckboxRowProps<T extends string> = {
  label: string;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  values: readonly T[];
  onToggle: (value: T) => void;
};

/** Labelled row of checkboxes; any number can be ticked. */
export const CheckboxRow = <T extends string>({
  label,
  options,
  labels,
  values,
  onToggle,
}: CheckboxRowProps<T>) => (
  <FormControl sx={{ pb: `${CAPTION_BLOCK_PX}px` }}>
    <FormLabel sx={{ fontSize: GROUP_LABEL_PX }}>{label}</FormLabel>
    <FormGroup row>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          onMouseDown={focusLabelControl}
          control={
            <Checkbox size='small' checked={values.includes(option)} onChange={() => onToggle(option)} />
          }
          label={labels?.[option] ?? option}
          slotProps={{ typography: { sx: { fontSize: OPTION_LABEL_PX } } }}
        />
      ))}
    </FormGroup>
  </FormControl>
);
