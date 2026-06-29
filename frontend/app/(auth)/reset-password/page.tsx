'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { Box, Typography, Alert, CircularProgress, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { CheckCircle, ArrowBack } from '@mui/icons-material';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setSubmitError('No reset token found. Please request a new password reset link.');
      return;
    }
    setSubmitError(null);
    try {
      await authApi.resetPassword(token, values.newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Reset failed. Your token may have expired — please request a new one.';
      setSubmitError(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        bgcolor: '#f4f4f5',
      }}
    >
      {/* Left brand panel */}
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
          New Start.<br />
          <Box component="span" sx={{ color: '#f2622a' }}>New Password.</Box>
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
          Choose a strong password you haven&apos;t used before. You&apos;ll be logged in right after.
        </Typography>
      </Box>

      {/* Right form panel */}
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
          <Box
            component={NextLink}
            href="/forgot-password"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              mb: 4,
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 600,
              fontSize: '13px',
              color: '#71717a',
              textDecoration: 'none',
              '&:hover': { color: '#f2622a' },
            }}
          >
            <ArrowBack sx={{ fontSize: 16 }} />
            Back
          </Box>

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
            Set New Password
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
            {token ? 'Your reset token is loaded. Choose a new password below.' : 'No token detected — go back and request a new reset link.'}
          </Typography>

          {/* Success state */}
          {success && (
            <Box
              sx={{
                background: 'rgba(22,163,74,0.06)',
                border: '1px solid rgba(22,163,74,0.25)',
                borderRadius: '14px',
                p: '20px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '8px' }}>
                <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#16a34a' }}>
                  Password Updated
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', color: '#052e16', lineHeight: 1.65 }}>
                Your password has been updated successfully. Redirecting you to login…
              </Typography>
            </Box>
          )}

          {!token && !success && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px', fontFamily: '"Manrope", sans-serif' }}>
              No reset token in URL. Please{' '}
              <Box component={NextLink} href="/forgot-password" sx={{ color: '#f2622a', fontWeight: 700, textDecoration: 'none' }}>
                request a new one
              </Box>
              .
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {!success && token && (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ mb: '6px', fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
                New Password
              </Box>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    fullWidth
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Box sx={{ mb: '6px', fontFamily: '"Manrope", sans-serif', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
                Confirm Password
              </Box>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    fullWidth
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Box
                component="button"
                type="submit"
                disabled={isSubmitting}
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
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease',
                  '&:hover:not(:disabled)': { background: '#d94e18' },
                  '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
                }}
              >
                {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Update Password'}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
