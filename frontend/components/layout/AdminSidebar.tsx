'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingBag,
  SportsSoccer,
  Logout,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const SIDEBAR_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: <Dashboard /> },
  { label: 'Products', href: '/admin/products', icon: <Inventory /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag /> },
];

/**
 * Persistent left sidebar for the admin panel.
 * Highlights the active route using Next.js usePathname().
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: '#200E32',
          color: '#fff',
          borderRight: 'none',
        },
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SportsSoccer sx={{ color: 'secondary.main', fontSize: 26 }} />
        <Box>
          <Typography variant="body1" fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            SportsPlusStore
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <ListItemButton
              key={item.href}
              component={NextLink}
              href={item.href}
              sx={{
                borderRadius: 2,
                mx: 0,
                mb: 0.5,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                bgcolor: isActive ? 'rgba(46,204,113,0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'secondary.main' : 'rgba(255,255,255,0.5)',
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Logout */}
      <Box sx={{ px: 1, py: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { bgcolor: 'rgba(231,76,60,0.15)', color: '#E74C3C' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{ fontSize: '0.9rem' }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
