import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#f2622a',   // APEX orange — brand anchor
      light: '#ff7a2e',
      dark: '#d94e18',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#18181b',   // Near-black — dark elements
      light: '#3a3a40',
      dark: '#0c0c0e',
      contrastText: '#FFFFFF',
    },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#e63946' },
    info: { main: '#1d4ed8' },
    background: {
      default: '#f4f4f5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#18181b',
      secondary: '#71717a',
      disabled: '#a1a1aa',
    },
    divider: '#ededf0',
  },
  typography: {
    fontFamily: '"Manrope", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Saira Condensed", sans-serif',
      fontSize: '4rem',
      fontWeight: 800,
      fontStyle: 'italic',
      lineHeight: 0.96,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Saira Condensed", sans-serif',
      fontSize: '2.125rem',
      fontWeight: 800,
      fontStyle: 'italic',
      lineHeight: 1.1,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    h3: {
      fontFamily: '"Saira Condensed", sans-serif',
      fontSize: '1.75rem',
      fontWeight: 800,
      fontStyle: 'italic',
      lineHeight: 1.15,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
    body1: { fontFamily: '"Manrope", sans-serif', fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontFamily: '"Manrope", sans-serif', fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontFamily: '"Manrope", sans-serif', fontSize: '0.75rem', lineHeight: 1.66, color: '#71717a' },
    overline: {
      fontFamily: '"Manrope", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    button: {
      fontFamily: '"Saira", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: '"Saira", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          transition: 'background 0.2s ease, transform 0.12s ease',
          '&:active': { transform: 'scale(0.97)' },
        },
        containedPrimary: {
          background: '#f2622a',
          '&:hover': { background: '#d94e18' },
        },
        containedSecondary: {
          background: '#18181b',
          '&:hover': { background: '#3a3a40' },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
        sizeLarge: { padding: '15px 32px', fontSize: '0.9375rem' },
        sizeSmall: { padding: '6px 16px', fontSize: '0.8rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: '1px solid #ededf0',
          background: '#fff',
          transition: 'box-shadow 0.32s cubic-bezier(.2,.7,.2,1), transform 0.32s cubic-bezier(.2,.7,.2,1), border-color 0.32s',
          '&:hover': {
            boxShadow: '0 18px 40px rgba(0,0,0,0.14)',
            transform: 'translateY(-6px)',
            borderColor: '#fff',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Manrope", sans-serif',
            borderRadius: 10,
            background: '#fafafa',
            '& fieldset': { borderColor: '#e7e7ea', borderWidth: '1.5px' },
            '&:hover fieldset': { borderColor: '#f2622a' },
            '&.Mui-focused fieldset': { borderColor: '#f2622a', borderWidth: '1.5px' },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: '#f7f7f8',
            fontWeight: 700,
            fontFamily: '"Saira", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '0.75rem',
            color: '#18181b',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Saira", sans-serif',
          fontWeight: 700,
          borderRadius: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          fontSize: '0.7rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none', background: '#0c0c0e' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: '#fff', boxShadow: 'none', borderBottom: '1px solid #ededf0' },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            borderRadius: 8,
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            background: '#f2622a',
            color: '#fff',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: '1px solid #ededf0',
          borderRadius: '12px !important',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: '#f2622a' },
        thumb: { '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(242,98,42,0.16)' } },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#e7e7ea',
          '&.Mui-checked': { color: '#f2622a' },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: '"Saira", sans-serif',
          fontWeight: 800,
          fontSize: '0.7rem',
          background: '#f2622a',
          color: '#fff',
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
export default theme;
