import { ClearButton } from '@/common/components/buttons/clearButton';
import { usePageBar } from '@/common/components/hooks/usePageBar';
import { gray } from '@/styles/palette';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type PageBarProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const TEXT_PX = 12;
const BUTTON_PX = 24;
const FIELD_WIDTH_PX = 44;

const buttonSx = { p: 0, minWidth: 0, width: BUTTON_PX, height: BUTTON_PX } as const;
const iconSx = { fontSize: TEXT_PX + 6 } as const;
const fieldSx = {
  width: FIELD_WIDTH_PX,
  '& .MuiInputBase-input': { fontSize: TEXT_PX, textAlign: 'center', py: 0.25, px: 0.5 },
} as const;

type StepButtonProps = { label: string; disabled: boolean; onClick: () => void; children: ReactNode };

const StepButton = ({ label, disabled, onClick, children }: StepButtonProps) => (
  <ClearButton rounded aria-label={label} disabled={disabled} onClick={onClick} sx={buttonSx}>
    {children}
  </ClearButton>
);

/** `|< < [page] / count > >|`; the field only accepts pages in range and applies on Enter or blur. */
export const PageBar = (props: PageBarProps) => {
  const bar = usePageBar(props);

  return (
    <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', pt: 1 }}>
      <StepButton label='First page' disabled={bar.first} onClick={bar.goFirst}>
        <FirstPageIcon sx={iconSx} />
      </StepButton>
      <StepButton label='Previous page' disabled={bar.first} onClick={bar.goPrevious}>
        <NavigateBeforeIcon sx={iconSx} />
      </StepButton>
      <TextField
        size='small'
        value={bar.draft}
        onChange={bar.onDraftChange}
        onBlur={bar.onDraftBlur}
        onFocus={bar.onDraftFocus}
        slotProps={{
          htmlInput: { inputMode: 'numeric', 'aria-label': 'Page', onKeyDown: bar.onDraftKeyDown },
        }}
        sx={fieldSx}
      />
      <Typography sx={{ fontSize: TEXT_PX, color: gray[50], whiteSpace: 'nowrap' }}>
        / {props.pageCount}
      </Typography>
      <StepButton label='Next page' disabled={bar.last} onClick={bar.goNext}>
        <NavigateNextIcon sx={iconSx} />
      </StepButton>
      <StepButton label='Last page' disabled={bar.last} onClick={bar.goLast}>
        <LastPageIcon sx={iconSx} />
      </StepButton>
    </Stack>
  );
};
