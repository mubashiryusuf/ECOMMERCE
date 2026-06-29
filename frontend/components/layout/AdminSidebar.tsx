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
  Logout,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const SIDEBAR_WIDTH = 230;

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: <Dashboard /> },
  { label: 'Products', href: '/admin/products', icon: <Inventory /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag /> },
];

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
          background: '#0c0c0e',
          color: '#fff',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2,
          py: 3,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Box
          sx={{
            display: 'inline-block',
            width: 26,
            height: 26,
            background: 'linear-gradient(135deg, #ff7a2e, #f2541c)',
            clipPath: 'polygon(0 0, 100% 0, 68% 100%, 0% 100%)',
            transform: 'skewX(-8deg)',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: '18px',
            textTransform: 'uppercase',
            color: '#fff',
            letterSpacing: '0.02em',
          }}
        >
          APEX{' '}
          <Box component="span" sx={{ fontFamily: '"Manrope", sans-serif', fontStyle: 'normal', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#71717a' }}>
            ADMIN
          </Box>
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, flexGrow: 1 }}>
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
                borderRadius: '10px',
                mb: '4px',
                py: '10px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                bgcolor: isActive ? 'rgba(242,98,42,0.16)' : 'transparent',
                borderLeft: isActive ? '3px solid #f2622a' : '3px solid transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(242,98,42,0.2)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#f2622a' : 'rgba(255,255,255,0.4)',
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontFamily: '"Saira", sans-serif',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2, mb: 1 }} />

      {/* Logout */}
      <Box sx={{ px: 2, pb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { bgcolor: 'rgba(230,57,70,0.14)', color: '#e63946' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontFamily: '"Saira", sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
