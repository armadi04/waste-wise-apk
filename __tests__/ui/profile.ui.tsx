/// <reference types="jest" />
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Alert } from 'react-native';

import ProfileScreen from '../../app/(tabs)/profile';

jest.mock('@/auth/auth-provider', () => ({
  useAuth: () => ({
    user: {
      fullname: 'Explore',
      email: 'explore@example.com',
      avatar: null,
      roles: [{ name: 'user' }],
    },
    signOut: jest.fn().mockResolvedValue(undefined),
    reloadProfile: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.3' } },
}));

jest.mock('@/theme', () => {
  const tokens = jest.requireActual('@/theme/tokens');
  return {
    useTheme: () => ({
      mode: 'light',
      preference: 'system',
      colors: tokens.lightColors,
      spacing: tokens.spacing,
      radius: tokens.radius,
      typography: tokens.typography,
      fontFamily: tokens.fontFamily,
      setPreference: jest.fn(),
      hydrated: true,
    }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: () => null,
  Circle: () => null,
  Defs: () => null,
  G: () => null,
  LinearGradient: () => null,
  Path: () => null,
  RadialGradient: () => null,
  Rect: () => null,
  Stop: () => null,
}));
jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

describe('profile screen', () => {
  it('shows a capitalized role and no header refresh button', async () => {
    await render(<ProfileScreen />);
    expect(screen.getByText('User')).toBeTruthy();
    expect(screen.queryByText('Refresh')).toBeNull();
    expect(screen.getByText('WasteWise v1.2.3')).toBeTruthy();
  });

  it('confirms before logging out', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<ProfileScreen />);
    fireEvent.press(screen.getByLabelText('Log out'));
    expect(alert).toHaveBeenCalledWith(
      'Log out?',
      expect.any(String),
      expect.any(Array),
    );
  });
});
