import { EditModeButton } from '@/components/buttons/editModeButton';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

export const PageContent = () => (
  <Box component='main' sx={{ display: 'flex', height: `calc(100vh - ${BANNER_HEIGHT})` }}>
    <Box sx={{ flex: 1, minWidth: 0, p: 3 }}>
      <WidgetGrid />
    </Box>
    <Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />
    <Box component='aside' sx={{ p: 3 }}>
      <EditModeButton />
    </Box>
  </Box>
);
