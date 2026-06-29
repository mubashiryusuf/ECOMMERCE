import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#200E32',   // Deep purple-navy — brand anchor (header/footer/sidebar)
      light: '#3D1F5C',
      dark: '#120820',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2ECC71',   // Vibrant green — CTAs, highlights, active states
      light: '#58D68D',
      dark: '#1E8449',
      contrastText: '#FFFFFF',
    },
    success: { main: '#27AE60' },
    warning: { main: '#F39C12' },
    error: { main: '#E74C3C' },
    info: { main: '#2980B9' },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
    // Custom tokens accessed via theme.palette.custom.*
    custom: {
      saleRed: '#E74C3C',
      saleBg: '#FFF5F5',
      stockLow: '#F59E0B',
      stockOut: '#EF4444',
      adminSidebar: '#200E32',
      adminHover: '#3D1F5C',
      cardBorder: '#E5E7EB',
      dealGreen: '#2ECC71',
      heroDark: 'rgba(32,14,50,0.85)',
    } as Record<string, string>,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.35 },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', lineHeight: 1.66, color: '#6B7280' },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    button: { fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 6px rgba(0,0,0,0.10)',
    '0 4px 12px rgba(0,0,0,0.10)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 16px 48px rgba(0,0,0,0.14)',
    ...Array(19).fill('none'),
  ] as Parameters<typeof createTheme>[0]['shadows'],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, textTransform: 'none', padding: '10px 24px' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #200E32 0%, #3D1F5C 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #120820 0%, #200E32 100%)' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1E8449 0%, #2ECC71 100%)' },
        },
        sizeLarge: { padding: '12px 32px', fontSize: '1rem' },
        sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3D1F5C' },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: '#F8F9FA',
            fontWeight: 600,
            color: '#1A1A2E',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none', background: '#200E32' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: '#200E32', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
export default theme;
