import { createContext, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';

export const FLOATING_TAB_BAR_HEIGHT = 64;

/** Distance from the screen bottom to the floating bar. */
export function useFloatingTabBarOffset(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, spacing.md) + spacing.sm;
}

/** Space scrollable content must reserve so it can scroll above the bar. */
export function useFloatingTabBarInset(): number {
  return FLOATING_TAB_BAR_HEIGHT + useFloatingTabBarOffset() + spacing.lg;
}

/** Set by the tabs layout; 0 for screens outside the tab navigator. */
export const TabBarInsetContext = createContext(0);

export function useTabBarInset(): number {
  return useContext(TabBarInsetContext);
}
