'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import { Close, MarkEmailRead } from '@mui/icons-material';
import { adminApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { ContactQuery } from '@/types';

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ContactQuery['status'] }) {
  const isNew = status === 'NEW';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: '10px',
        py: '3px',
        borderRadius: '20px',
        fontSize: '11px',
        fontFamily: '"Saira", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: isNew ? 'rgba(251,146,60,0.15)' : 'rgba(161,161,170,0.15)',
        color: isNew ? '#c2410c' : '#52525b',
      }}
    >
      {status}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows while loading
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 90px 120px 120px',
            px: '20px',
            py: '14px',
            borderBottom: '1px solid #f0f0f1',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {Array.from({ length: 6 }).map((_, j) => (
            <Skeleton key={j} height={18} sx={{ borderRadius: '6px' }} />
          ))}
        </Box>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Message detail dialog
// ---------------------------------------------------------------------------

interface QueryDialogProps {
  query: ContactQuery | null;
  onClose: () => void;
  onMarkReviewed: (id: string) => Promise<void>;
  markingId: string | null;
}

function QueryDialog({ query, onClose, onMarkReviewed, markingId }: QueryDialogProps) {
  if (!query) return null;
  const isNew = query.status === 'NEW';
  const isMarking = markingId === query.id;

  return (
    <Dialog
      open={Boolean(query)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '14px', border: '1px solid #ededf0' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          pb: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '20px',
              color: '#18181b',
              lineHeight: 1.2,
            }}
          >
            {query.subject}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: '6px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#52525b', fontWeight: 600 }}>
              {query.firstName} {query.lastName}
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
              &lt;{query.email}&gt;
            </Typography>
            <StatusBadge status={query.status} />
          </Box>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', color: '#a1a1aa', mt: '4px' }}>
            {new Date(query.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#a1a1aa',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            mt: '2px',
            '&:hover': { color: '#18181b' },
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box
          sx={{
            background: '#fafafa',
            border: '1px solid #ededf0',
            borderRadius: '10px',
            p: '16px 20px',
            mt: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontSize: '14px',
              color: '#18181b',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {query.message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: '8px' }}>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          sx={{
            height: 38,
            px: '16px',
            border: '1.5px solid #ededf0',
            borderRadius: '8px',
            background: 'transparent',
            color: '#52525b',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
            '&:hover': { borderColor: '#a1a1aa' },
          }}
        >
          Close
        </Box>
        {isNew && (
          <Box
            component="button"
            type="button"
            onClick={() => onMarkReviewed(query.id)}
            disabled={isMarking}
            sx={{
              height: 38,
              px: '16px',
              border: 'none',
              borderRadius: '8px',
              background: '#f2622a',
              color: '#fff',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '12px',
              cursor: isMarking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
              '&:hover:not(:disabled)': { background: '#d94e18' },
              '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
            }}
          >
            {isMarking && <CircularProgress size={13} sx={{ color: '#fff' }} />}
            <MarkEmailRead sx={{ fontSize: 15 }} />
            {isMarking ? 'Updating…' : 'Mark as Reviewed'}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminContactQueriesPage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dialog state
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);

  // Optimistic update tracking
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listContactQueries()
      .then((data) => setQueries(data))
      .catch((err: unknown) => setLoadError(getErrorMessage(err, 'Failed to load contact queries')))
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkReviewed = async (id: string) => {
    setMarkingId(id);
    setMarkError(null);
    try {
      const updated = await adminApi.updateContactQueryStatus(id, 'REVIEWED');
      setQueries((prev) => prev.map((q) => (q.id === id ? updated : q)));
      // Update dialog state too so the badge refreshes in place
      setSelectedQuery((prev) => (prev?.id === id ? updated : prev));
    } catch (err: unknown) {
      setMarkError(getErrorMessage(err, 'Failed to update status'));
    } finally {
      setMarkingId(null);
    }
  };

  const newCount = queries.filter((q) => q.status === 'NEW').length;

  return (
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '30px',
              color: '#18181b',
            }}
          >
            Contact Queries
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
            {isLoading ? 'Loading…' : `${queries.length} quer${queries.length !== 1 ? 'ies' : 'y'} · ${newCount} new`}
          </Typography>
        </Box>
      </Box>

      {markError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setMarkError(null)}>
          {markError}
        </Alert>
      )}
      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{loadError}</Alert>
      )}

      {/* Table */}
      <Box
        sx={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #ededf0',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 90px 120px 120px',
            px: '20px',
            py: '12px',
            background: '#f7f7f8',
            borderBottom: '1px solid #ededf0',
          }}
        >
          {['Name', 'Email', 'Subject', 'Status', 'Date', 'Actions'].map((col) => (
            <Typography
              key={col}
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '11px',
                color: '#71717a',
              }}
            >
              {col}
            </Typography>
          ))}
        </Box>

        {isLoading ? (
          <TableSkeleton />
        ) : queries.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
              No contact queries yet.
            </Typography>
          </Box>
        ) : (
          queries.map((query) => {
            const isMarking = markingId === query.id;
            return (
              <Box
                key={query.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 90px 120px 120px',
                  px: '20px',
                  py: '14px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f1',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { background: 'rgba(242,98,42,0.03)' },
                }}
              >
                {/* Name */}
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#18181b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 1,
                  }}
                >
                  {query.firstName} {query.lastName}
                </Typography>

                {/* Email */}
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '12px',
                    color: '#52525b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 1,
                  }}
                >
                  {query.email}
                </Typography>

                {/* Subject */}
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '12.5px',
                    color: '#52525b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 1,
                  }}
                >
                  {query.subject}
                </Typography>

                {/* Status badge */}
                <Box>
                  <StatusBadge status={query.status} />
                </Box>

                {/* Date */}
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a' }}>
                  {new Date(query.createdAt).toLocaleDateString()}
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setSelectedQuery(query)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      height: 30,
                      px: '10px',
                      borderRadius: '7px',
                      border: '1px solid #ededf0',
                      background: 'transparent',
                      color: '#52525b',
                      cursor: 'pointer',
                      fontFamily: '"Saira", sans-serif',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      transition: 'border-color 0.15s ease, color 0.15s ease',
                      '&:hover': { borderColor: '#f2622a', color: '#f2622a' },
                    }}
                  >
                    View
                  </Box>

                  {query.status === 'NEW' && (
                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleMarkReviewed(query.id)}
                      disabled={isMarking}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        height: 30,
                        px: '10px',
                        borderRadius: '7px',
                        border: '1px solid #ededf0',
                        background: 'transparent',
                        color: '#71717a',
                        cursor: isMarking ? 'not-allowed' : 'pointer',
                        fontFamily: '"Saira", sans-serif',
                        fontWeight: 700,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        transition: 'border-color 0.15s ease, color 0.15s ease',
                        '&:hover:not(:disabled)': { borderColor: '#f2622a', color: '#f2622a' },
                        '&:disabled': { opacity: 0.5 },
                      }}
                    >
                      {isMarking ? (
                        <CircularProgress size={11} sx={{ color: 'currentColor' }} />
                      ) : (
                        <MarkEmailRead sx={{ fontSize: 13 }} />
                      )}
                      Done
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Detail dialog */}
      <QueryDialog
        query={selectedQuery}
        onClose={() => setSelectedQuery(null)}
        onMarkReviewed={handleMarkReviewed}
        markingId={markingId}
      />
    </Box>
  );
}
