import { TransactionTypeDisplay } from '@/common/components/transactionTypeDisplay';
import type { DetailSection } from '@/features/widgets/instrument/dialog/detailSections';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';

export type DetailFieldsProps = {
  sections: DetailSection[];
  /** Fields per row; each field takes an equal share of the width. */
  columns: number;
};

export const FIELD_FONT_PX = 14;
const FIELD_HEIGHT_PX = 60;
const LABEL_OPACITY = 0.6;

const divider = <Divider sx={{ borderColor: gray[50] }} />;

/** Sections of label/value fields in a wrapping grid, split by dividers. */
export const DetailFields = ({ sections, columns }: DetailFieldsProps) => (
  <>
    {sections.map((section, index) => (
      <Fragment key={section.id}>
        {index > 0 && divider}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', py: 2 }}>
          {section.fields.map((field) => (
            <Box
              key={field.label}
              sx={{
                width: `${100 / columns}%`,
                height: FIELD_HEIGHT_PX,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: FIELD_FONT_PX, lineHeight: 1, opacity: LABEL_OPACITY }}>
                {field.label}
              </Typography>
              {'side' in field ? (
                <TransactionTypeDisplay
                  side={field.side}
                  fontSize={FIELD_FONT_PX}
                  sx={{ alignSelf: 'flex-start' }}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: FIELD_FONT_PX,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {field.value}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Fragment>
    ))}
  </>
);
