import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '@/features/theme/themeSlice.js';

/** Applies light-only theme (iOS style). */
export const useTheme = () => {
  const mode = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, [mode]);

  return { mode };
};
