import { createTheme } from '@mui/material/styles';

const PRIMARY = '#004593';
const PRIMARY_LIGHT = '#2f6fbe';
const PRIMARY_DARK = '#00336f';
const SECONDARY = '#0f9f8f';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: PRIMARY,
        light: PRIMARY_LIGHT,
        dark: PRIMARY_DARK,
        contrastText: '#ffffff',
      },
      secondary: {
        main: SECONDARY,
        light: '#42c5b8',
        dark: '#08776d',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f5f7fb' : '#0b1220',
        paper: mode === 'light' ? '#ffffff' : '#111827',
      },
      text: {
        primary: mode === 'light' ? '#101827' : '#e5edf7',
        secondary: mode === 'light' ? '#5f6b7a' : '#9aa8ba',
      },
      divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      success: { main: '#10b981' },
      info: { main: '#3b82f6' },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, letterSpacing: 0 },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
      '0 8px 16px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.04)',
      '0 12px 24px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.04)',
      '0 16px 32px rgba(0,0,0,0.08), 0 5px 10px rgba(0,0,0,0.04)',
      '0 20px 40px rgba(0,69,147,0.12), 0 6px 12px rgba(0,0,0,0.04)',
      '0 24px 48px rgba(0,69,147,0.14), 0 8px 16px rgba(0,0,0,0.05)',
      '0 28px 56px rgba(0,69,147,0.16), 0 10px 20px rgba(0,0,0,0.06)',
      ...Array(16).fill('none'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          html: { scrollBehavior: 'smooth' },
          body: {
            transition: 'background-color 0.3s ease',
          },
          '::-webkit-scrollbar': { width: '6px', height: '6px' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? 'rgba(0,69,147,0.28)' : 'rgba(47,111,190,0.45)',
            borderRadius: '10px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '8px 18px',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'translateY(-1px)' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
            boxShadow: '0 4px 14px rgba(0,69,147,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,69,147,0.38)',
            },
          },
          outlinedSecondary: {
            borderColor: SECONDARY,
            color: SECONDARY,
            '&:hover': { background: 'rgba(15,159,143,0.08)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light'
              ? '0 4px 16px rgba(0,0,0,0.06)'
              : '0 4px 16px rgba(0,0,0,0.3)',
            border: mode === 'light'
              ? '1px solid rgba(0,0,0,0.06)'
              : '1px solid rgba(255,255,255,0.06)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light'
                ? '0 16px 40px rgba(0,69,147,0.13)'
                : '0 16px 40px rgba(0,0,0,0.5)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: PRIMARY,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light'
              ? '0 1px 0 rgba(0,0,0,0.08)'
              : '0 1px 0 rgba(255,255,255,0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            border: 'none',
          },
        },
      },
    },
  });
