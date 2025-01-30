import * as React from 'react'
import { Box, Typography } from '@mui/material'

export interface ITabProps {
  id: string
  'aria-controls': string
}

export function tabProps(index: number): ITabProps {
  return {
    id: `form-tab-${index}`,
    'aria-controls': `form-tabpanel-${index}`,
  };
}

export interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>
            <div className='tab-panel'>
              {children}
            </div>
          </Typography>
        </Box>
      )}
    </div>
  );
}