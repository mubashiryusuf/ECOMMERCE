'use client';

import { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { contactApi } from '@/lib/api';

const INFO = [
  {
    label: 'Email',
    value: 'hello@apex.store',
    sub: 'We reply within 24 hours',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    value: '+1 (800) APEX-123',
    sub: 'Mon–Sat · 10:30–18:30',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: 'Location',
    value: '14 Performance Ave, New York, NY 10001',
    sub: 'Showroom open Mon–Sat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Controlled Field component
// ---------------------------------------------------------------------------

interface FieldProps {
  label: string;
  type?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
}

function Field({ label, type = 'text', rows, value, onChange }: FieldProps) {
  const sharedSx = {
    width: '100%',
    fontFamily: '"Manrope", sans-serif',
    fontSize: '14px',
    color: '#18181b',
    background: '#fafafa',
    border: '1.5px solid #e7e7ea',
    borderRadius: '10px',
    px: '16px',
    py: rows ? '12px' : 0,
    height: rows ? 'auto' : 48,
    outline: 'none',
    resize: rows ? 'vertical' : 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#f2622a', background: '#fff' },
    transition: 'border-color 0.2s, background 0.2s',
  } as const;

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#52525b', mb: '6px' }}>
        {label}
      </Typography>
      {rows ? (
        <Box
          component="textarea"
          rows={rows}
          sx={sharedSx}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        />
      ) : (
        <Box
          component="input"
          type={type}
          sx={sharedSx}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Controlled field state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSending(true);
    try {
      await contactApi.submit({ firstName, lastName, email, subject, message });
      setSent(true);
    } catch {
      setSubmitError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#101012', py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', color: '#f2622a', textTransform: 'uppercase', mb: 1.5 }}>
            Get In Touch
          </Typography>
          <Typography sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: { xs: '40px', md: '56px' }, textTransform: 'uppercase', color: '#fff', lineHeight: 0.95 }}>
            Contact<br /><Box component="span" sx={{ color: '#f2622a' }}>Us</Box>
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', mt: 2 }}>
            We typically respond within one business day.
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, width: '100%' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.6fr' }, gap: 4, alignItems: 'start' }}>

          {/* Info cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {INFO.map((item) => (
              <Box key={item.label} sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '14px', p: '20px 24px', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(242,98,42,0.1)', color: '#f2622a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a1a1aa', mb: '2px' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: '#18181b', mb: '2px' }}>
                    {item.value}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
                    {item.sub}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Contact form */}
          <Box sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '16px', p: { xs: '24px', md: '36px' } }}>
            {sent ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(242,98,42,0.1)', color: '#f2622a', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </Box>
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', color: '#18181b', mb: 1 }}>Message Sent!</Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a' }}>
                  Thanks for reaching out. We will get back to you within 24 hours.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#18181b', mb: 1 }}>
                  Send a Message
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Field label="First Name" value={firstName} onChange={setFirstName} />
                  <Field label="Last Name" value={lastName} onChange={setLastName} />
                </Box>
                <Field label="Email Address" type="email" value={email} onChange={setEmail} />
                <Field label="Subject" value={subject} onChange={setSubject} />
                <Field label="Message" rows={5} value={message} onChange={setMessage} />

                {submitError && (
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#e63946', mt: '-4px' }}>
                    {submitError}
                  </Typography>
                )}

                <Box
                  component="button"
                  type="submit"
                  disabled={sending}
                  sx={{
                    height: 50,
                    border: 'none',
                    borderRadius: '10px',
                    background: '#f2622a',
                    color: '#fff',
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 800,
                    fontSize: '14px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    mt: 1,
                    '&:hover:not(:disabled)': { background: '#d94e18' },
                    transition: 'background 0.2s',
                  }}
                >
                  {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Send Message'}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
