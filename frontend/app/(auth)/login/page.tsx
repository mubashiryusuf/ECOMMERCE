'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { Box, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const { login, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    clearError();
    try {
      await login(values.email, values.password);
      router.push(redirectTo);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password';
      setSubmitError(message);
    }
  };

  const displayError = submitError ?? error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        bgcolor: '#f4f4f5',
      }}
    >
      {/* Left — brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#101012',
          px: 8,
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative shape */}
        <Box
          sx={{
            position: 'absolute',
            right: -60,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 260,
            height: 260,
            background: 'rgba(242,98,42,0.12)',
            borderRadius: '30px',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px', mb: 5 }}>
          <Box
            sx={{
              display: 'inline-block',
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #ff7a2e, #f2541c)',
              clipPath: 'polygon(0 0, 100% 0, 68% 100%, 0% 100%)',
              transform: 'skewX(-8deg)',
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              fontSize: '28px',
              textTransform: 'uppercase',
              color: '#fff',
              letterSpacing: '0.02em',
              '& span': { color: '#f2622a' },
            }}
          >
            APEX<span>.</span>
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '52px',
            lineHeight: 0.92,
            color: '#fff',
            mb: 3,
          }}
        >
          Gear Up.<br />
          <Box component="span" sx={{ color: '#f2622a' }}>Level Up.</Box>
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65,
            maxWidth: 340,
          }}
        >
          Premium sports equipment, footwear, and apparel from the brands that define the game.
        </Typography>
      </Box>

      {/* Right — form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 6 },
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '38px',
              color: '#18181b',
              mb: '6px',
            }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
            Sign in to your account to continue shopping
          </Typography>

          {displayError && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: '10px', fontFamily: '"Manrope", sans-serif' }}
              onClose={() => { setSubmitError(null); clearError(); }}
            >
              {displayError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ mb: '6px', fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
              Email Address
            </Box>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="email"
                  fullWidth
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
              <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
                Password
              </Box>
              <Box
                component={NextLink}
                href="/forgot-password"
                sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#f2622a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Box>
            </Box>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  fullWidth
                  placeholder="Your password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Box
              component="button"
              type="submit"
              disabled={isLoading}
              sx={{
                width: '100%',
                height: 54,
                border: 'none',
                borderRadius: '12px',
                background: '#f2622a',
                color: '#fff',
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                transition: 'background 0.2s ease',
                '&:hover:not(:disabled)': { background: '#d94e18' },
                '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
              }}
            >
              {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Box>
          </Box>

          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Box
              component={NextLink}
              href="/signup"
              sx={{ color: '#f2622a', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Create one
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
