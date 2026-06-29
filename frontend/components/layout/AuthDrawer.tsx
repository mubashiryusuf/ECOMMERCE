'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { Box, Drawer, TextField, Divider, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Required').email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.string().min(1, 'Required').email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

interface AuthDrawerProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  redirectTo?: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b', mb: '6px' }}>
      {children}
    </Box>
  );
}

function ApexButton({ children, loading, onClick, type = 'button', variant = 'solid' }: {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'outline';
}) {
  return (
    <Box
      component="button"
      type={type}
      onClick={onClick}
      disabled={loading}
      sx={{
        width: '100%',
        height: 50,
        border: variant === 'outline' ? '1.5px solid #e7e7ea' : 'none',
        borderRadius: '10px',
        background: variant === 'solid' ? '#f2622a' : 'transparent',
        color: variant === 'solid' ? '#fff' : '#18181b',
        fontFamily: '"Saira", sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: '14px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        '&:hover:not(:disabled)': {
          background: variant === 'solid' ? '#d94e18' : '#f4f4f5',
        },
        '&:disabled': { opacity: 0.6 },
      }}
    >
      {loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : children}
    </Box>
  );
}

function SignInForm({ onSuccess, onAuthSuccess }: { onSuccess: () => void; onAuthSuccess?: () => void }) {
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      await login(values.email, values.password);
      onSuccess();
      setTimeout(() => onAuthSuccess?.(), 350);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password',
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <FieldLabel>Email Address</FieldLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} type="email" fullWidth placeholder="you@example.com"
              error={!!errors.email} helperText={errors.email?.message} size="small" />
          )}
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
          <FieldLabel>Password</FieldLabel>
          <Box
            component={NextLink}
            href="/forgot-password"
            onClick={onSuccess}
            sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', fontWeight: 600, color: '#f2622a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Forgot Password?
          </Box>
        </Box>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField {...field} type="password" fullWidth placeholder="Your password"
              error={!!errors.password} helperText={errors.password?.message} size="small" />
          )}
        />
      </Box>
      <ApexButton type="submit" loading={isLoading}>Sign In</ApexButton>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
        <Box sx={{ flex: 1, height: 1, background: '#e7e7ea' }} />
        <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>Or</Box>
        <Box sx={{ flex: 1, height: 1, background: '#e7e7ea' }} />
      </Box>
      <ApexButton variant="outline" onClick={() => onSuccess()}>
        Guest Checkout
      </ApexButton>
    </Box>
  );
}

function SignUpForm({ onSuccess, onAuthSuccess }: { onSuccess: () => void; onAuthSuccess?: () => void }) {
  const { signup, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignupValues) => {
    setError(null);
    try {
      await signup(values.name, values.email, values.password);
      onSuccess();
      setTimeout(() => onAuthSuccess?.(), 350);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not create account',
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <FieldLabel>Full Name</FieldLabel>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth placeholder="Jane Doe"
              error={!!errors.name} helperText={errors.name?.message} size="small" />
          )}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <FieldLabel>Email Address</FieldLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} type="email" fullWidth placeholder="you@example.com"
              error={!!errors.email} helperText={errors.email?.message} size="small" />
          )}
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <FieldLabel>Password</FieldLabel>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField {...field} type="password" fullWidth placeholder="Min 8 characters"
              error={!!errors.password} helperText={errors.password?.message} size="small" />
          )}
        />
      </Box>
      <ApexButton type="submit" loading={isLoading}>Create Account</ApexButton>
    </Box>
  );
}

const getTabSx = (active: boolean) => ({
  flex: 1,
  py: '11px',
  border: 'none',
  background: 'transparent',
  fontFamily: '"Saira", sans-serif',
  fontWeight: 700,
  fontSize: '13px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: active ? '#18181b' : '#a1a1aa',
  cursor: 'pointer' as const,
  borderBottom: active ? '2px solid #f2622a' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
});

export function AuthDrawer({ open, onClose, onAuthSuccess }: AuthDrawerProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const { loginWithGoogle } = useAuthStore();

  const TabBtn = ({ id, label }: { id: 'signin' | 'signup'; label: string }) => (
    <Box
      component="button"
      onClick={() => setTab(id)}
      sx={getTabSx(tab === id)}
    >
      {label}
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: '28px',
          overflowY: 'auto',
          background: '#fff',
          color: '#18181b',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: '22px', textTransform: 'uppercase', color: '#18181b' }}>
          Login or Signup
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#71717a', display: 'flex', p: '4px', borderRadius: '8px', '&:hover': { background: '#f4f4f5' } }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Box>
      </Box>

      {/* Google login */}
      <Box sx={{ mb: 2 }}>
        <GoogleLogin
          onSuccess={(cr) => {
            if (cr.credential) {
              loginWithGoogle(cr.credential)
                .then(() => { onClose(); setTimeout(() => onAuthSuccess?.(), 350); })
                .catch(() => {});
            }
          }}
          onError={() => {}}
          width="344"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 2 }}>
        <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa', px: 1 }}>or</Box>
      </Divider>

      {/* Tabs */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid #e7e7ea', mb: 3 }}>
        <TabBtn id="signin" label="Sign In" />
        <TabBtn id="signup" label="Sign Up" />
      </Box>

      {/* Form */}
      {tab === 'signin' ? (
        <SignInForm onSuccess={onClose} onAuthSuccess={onAuthSuccess} />
      ) : (
        <SignUpForm onSuccess={onClose} onAuthSuccess={onAuthSuccess} />
      )}
    </Drawer>
  );
}
