import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/uiSlice';

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return {
    theme,
    toggleTheme: () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))
  };
}
