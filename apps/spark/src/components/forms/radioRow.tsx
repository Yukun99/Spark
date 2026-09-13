import { CAPTION_BLOCK_PX } from '@/components/forms/captionProps';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

export const OPTION_LABEL_PX = 14;
export const GROUP_LABEL_PX = 12;

export type RadioRowProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  onChange: (value: T) => void;
};

/** Labelled row of radio options, padded like a text field so form rows line up. */
export const RadioRow = <T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: RadioRowProps<T>) => (
  <FormControl sx={{ pb: `${CAPTION_BLOCK_PX}px` }}>
    <FormLabel sx={{ fontSize: GROUP_LABEL_PX }}>{label}</FormLabel>
    <RadioGroup row value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          value={option}
          control={<Radio size='small' />}
          label={labels?.[option] ?? option}
          slotProps={{ typography: { sx: { fontSize: OPTION_LABEL_PX } } }}
        />
      ))}
    </RadioGroup>
  </FormControl>
);
