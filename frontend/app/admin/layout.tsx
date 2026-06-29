'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { getToken } from '@/lib/auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 230;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, loadUser } = useAuthStore();
  const hasToken = getToken();

  useEffect(() => {
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // If no token exists at all, redirect home immediately.
      // If a token exists, loadUser() is still in flight — wait for it.
      if (!getToken()) router.replace('/');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // Show spinner while token exists but user is not yet resolved (loadUser in flight)
  if (isLoading || (!user && hasToken)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress color="primary" size={48} thickness={4} />
      </Box>
    );
  }

  // No token and no user — redirect effect is in progress; render nothing briefly
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f7f8' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
