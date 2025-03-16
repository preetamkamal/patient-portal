// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a9396', // a teal-like color
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
    fontFamily: 'Inter, sans-serif',
  },
});

export default theme;
