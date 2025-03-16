// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a9396', // Teal
    },
    secondary: {
      main: '#005f73',
    },
    background: {
      default: '#f5f6f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;
