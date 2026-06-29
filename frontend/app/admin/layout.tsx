'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { getToken } from '@/lib/auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const Spinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CircularProgress color="primary" size={48} thickness={4} />
  </Box>
);

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, loadUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!user) {
      if (!getToken()) router.replace('/');
      return;
    }
    if (user.role !== 'ADMIN') router.replace('/');
  }, [user, isLoading, mounted, router]);

  // Before mount: server and client both render the same spinner (prevents hydration mismatch)
  if (!mounted || isLoading) return <Spinner />;

  // Auth resolved — not an admin, redirect in flight
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f7f7f8', overflow: 'hidden' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
