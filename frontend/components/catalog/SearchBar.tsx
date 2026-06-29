'use client';

import { useState, useCallback } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

/**
 * Debounced search input for the catalog page.
 * Calls onSearch after the user stops typing (300ms debounce).
 */
export function SearchBar({ defaultValue = '', placeholder = 'Search products...', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        onSearch(newValue.trim());
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer, onSearch],
  );

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} aria-label="Clear search">
              <Clear fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        bgcolor: 'background.paper',
        '& .MuiOutlinedInput-root': { borderRadius: 2 },
      }}
    />
  );
}
