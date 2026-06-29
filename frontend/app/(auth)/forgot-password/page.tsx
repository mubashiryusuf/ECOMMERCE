'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '@mui/material';
import { authApi } from '@/lib/api';
import { CheckCircle, ArrowBack } from '@mui/icons-material';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await authApi.forgotPassword(values.email);
      setMessage(res.message);
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
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
          Locked Out?<br />
          <Box component="span" sx={{ color: '#f2622a' }}>We Got You.</Box>
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
          Enter your email and we&apos;ll send you a link to reset your password and get back to the game.
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
            href="/login"
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
            Back to login
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
            Reset Password
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
            Enter your account email and we&apos;ll generate a reset link
          </Typography>

          {/* Success state */}
          {message && (
            <Box
              sx={{
                background: 'rgba(22,163,74,0.06)',
                border: '1px solid rgba(22,163,74,0.25)',
                borderRadius: '14px',
                p: '20px',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '10px' }}>
                <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                <Typography
                  sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#16a34a' }}
                >
                  Reset Link Generated
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', color: '#052e16', lineHeight: 1.65, mb: '14px' }}>
                {message}
              </Typography>

              {resetToken && (
                <>
                  <Box
                    sx={{
                      background: '#f7f7f8',
                      border: '1px solid #ededf0',
                      borderRadius: '8px',
                      p: '10px 12px',
                      mb: '14px',
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', fontWeight: 700, color: '#71717a', mb: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      Test Mode — Reset Token
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#18181b',
                        wordBreak: 'break-all',
                        lineHeight: 1.5,
                      }}
                    >
                      {resetToken}
                    </Typography>
                  </Box>
                  <Box
                    component={NextLink}
                    href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: 48,
                      border: 'none',
                      borderRadius: '12px',
                      background: '#f2622a',
                      color: '#fff',
                      fontFamily: '"Saira", sans-serif',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'background 0.2s ease',
                      '&:hover': { background: '#d94e18' },
                    }}
                  >
                    Use This Token →
                  </Box>
                </>
              )}
            </Box>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {!message && (
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
                {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
