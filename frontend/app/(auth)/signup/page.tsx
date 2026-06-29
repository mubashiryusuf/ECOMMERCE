'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Box, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError(null);
    clearError();
    try {
      await signup(values.name, values.email, values.password);
      router.push('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not create account. Please try again.';
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
        <Box
          sx={{
            position: 'absolute',
            right: -60,
            bottom: '20%',
            transform: 'rotate(45deg)',
            width: 220,
            height: 220,
            background: 'rgba(242,98,42,0.10)',
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
            fontSize: '48px',
            lineHeight: 0.92,
            color: '#fff',
            mb: 3,
          }}
        >
          Join the<br />
          <Box component="span" sx={{ color: '#f2622a' }}>Relentless.</Box>
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
          Create your free account and shop premium gear from the world's top performance brands.
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
            Create Account
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
            Join thousands of athletes and performance enthusiasts
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
              Full Name
            </Box>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

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

            <Box sx={{ mb: '6px', fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
              Password
            </Box>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  fullWidth
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
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
              {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
            </Box>
          </Box>

          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', textAlign: 'center' }}>
            Already have an account?{' '}
            <Box
              component={NextLink}
              href="/login"
              sx={{ color: '#f2622a', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign in
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
