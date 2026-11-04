import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  palette,
  radius,
  spacing,
  typography,
  fontFamily,
  type ThemeColors,
  type ThemeMode,
} from './tokens';

export type ThemePreference = 'system' | ThemeMode;

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  setPreference: (preference: ThemePreference) => Promise<void>;
  hydrated: boolean;
}

const THEME_KEY = 'wastewise.theme-preference';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
          setPreferenceState(value);
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const mode: ThemeMode =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const colors = palette[mode];

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(THEME_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      colors,
      spacing,
      radius,
      typography,
      fontFamily,
      setPreference,
      hydrated,
    }),
    [colors, hydrated, mode, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
