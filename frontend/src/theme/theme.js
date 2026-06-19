import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0', // Deep blue
    },
    secondary: {
      main: '#F57C00', // Amber
    },
    error: {
      main: '#C62828', // Red for low stock/price drops
    },
    warning: {
      main: '#F9A825', // Yellow for medium stock
    },
    success: {
      main: '#2E7D32', // Green for high stock/price increases
    },
    background: {
      default: '#F5F7FA', // Light grey page background
      paper: '#FFFFFF', // White card background
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Don't uppercase buttons
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;
