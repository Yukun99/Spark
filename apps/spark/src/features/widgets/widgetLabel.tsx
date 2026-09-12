import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type WidgetLabelProps = {
  children: string;
  caption?: string;
};

const LABEL_FONT_PX = 20;
const CAPTION_FONT_PX = 10;

/** Card title shown at the top of every widget, with an optional small caption beneath it. */
export const WidgetLabel = ({ children, caption }: WidgetLabelProps) => (
  <Box sx={{ textAlign: 'center', mb: 2 }}>
    <Typography variant='subtitle2' sx={{ fontSize: LABEL_FONT_PX }}>
      {children}
    </Typography>
    {caption !== undefined && (
      <Typography sx={{ fontSize: CAPTION_FONT_PX, lineHeight: 1, color: gray[50] }}>
        {caption}
      </Typography>
    )}
  </Box>
);
