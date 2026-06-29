import { Box, CircularProgress } from '@mui/material';

/**
 * Full-page centered loading spinner.
 * Used as Suspense fallback and during async data fetches.
 */
export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
      }}
    >
      <CircularProgress color="primary" size={48} thickness={4} />
    </Box>
  );
}
