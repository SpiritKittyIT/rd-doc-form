import * as React from 'react'
import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material'
import RdDocForm, { IRdDocFormProps } from './RdDocForm'

import './styles.css'
import './cards/cardStyles.css'

const ThemeProviderWrapper: React.FC<IRdDocFormProps> = (props) => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: props.theme.palette?.themePrimary ?? '#f50057',
        contrastText: props.theme.semanticColors?.primaryButtonText
      },
      text: {
        primary: props.theme.semanticColors?.bodyText ?? 'rgba(0, 0, 0, 0.87)',
        secondary: props.theme.semanticColors?.inputPlaceholderText ?? 'rgba(0, 0, 0, 0.6)',
        disabled: props.theme.semanticColors?.disabledText ?? 'rgba(0, 0, 0, 0.38)'
      }
    },
  };

  const theme = createTheme(themeOptions);
  
  return (
    <ThemeProvider theme={theme}>
      <RdDocForm {...props}/>
    </ThemeProvider>
  )
}

export default ThemeProviderWrapper
