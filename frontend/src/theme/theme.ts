import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary: PaletteOptions['primary'];
    neutral: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7900', // Orange Cameroun
      light: '#ff9a33',
      dark: '#c35000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#000',
      light: '#222',
      dark: '#000',
      contrastText: '#fff',
    },
    tertiary: {
      main: '#ff7900',
      light: '#ff9a33',
      dark: '#c35000',
      contrastText: '#fff',
    },
    neutral: {
      main: '#222',
      light: '#444',
      dark: '#000',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      contrastText: '#fff',
    },
    warning: {
      main: '#ed6c02',
      contrastText: '#fff',
    },
    info: {
      main: '#ff7900',
      contrastText: '#fff',
    },
    success: {
      main: '#388e3c',
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#000',
      secondary: '#444',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: -2, color: '#ff7900' },
    h2: { fontWeight: 800, letterSpacing: -2, color: '#ff7900' },
    h3: { fontWeight: 700, color: '#ff7900' },
    h4: { fontWeight: 700, color: '#ff7900' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none', color: '#fff' },
    subtitle1: { color: '#000' },
    subtitle2: { color: '#444' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          fontWeight: 700,
          fontSize: '1rem',
        },
        containedPrimary: {
          backgroundColor: '#ff7900',
          color: '#fff',
          '&:hover': { backgroundColor: '#ff9100' },
        },
        outlinedPrimary: {
          borderColor: '#ff7900',
          color: '#ff7900',
          '&:hover': { backgroundColor: '#fff3e0' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 16px 0 #ff79001a',
          border: '1px solid #ff7900',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#ff7900',
          color: '#fff',
        },
        colorSecondary: {
          backgroundColor: '#000',
          color: '#fff',
        },
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: '8px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme; 