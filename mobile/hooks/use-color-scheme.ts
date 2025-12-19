import { useTheme } from '../context/themeContext';

export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
