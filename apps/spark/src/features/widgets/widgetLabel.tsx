import Typography from '@mui/material/Typography';

export type WidgetLabelProps = {
  children: string;
};

const LABEL_FONT_PX = 20;

/** Card title shown at the top of every widget, in and out of edit mode. */
export const WidgetLabel = ({ children }: WidgetLabelProps) => (
  <Typography variant='subtitle2' sx={{ textAlign: 'center', fontSize: LABEL_FONT_PX, mb: 2 }}>
    {children}
  </Typography>
);
