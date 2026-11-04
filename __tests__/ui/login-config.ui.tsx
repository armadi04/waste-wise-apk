/// <reference types="jest" />
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';

jest.mock('@/auth/auth-provider', () => ({
  useAuth: () => ({
    isSigningIn: false,
    signInWithGoogle: jest.fn(),
  }),
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
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@/lib/config', () => ({ IS_GOOGLE_CONFIGURED: false }));
jest.mock('@/components/ui/google-icon', () => ({ GoogleIcon: () => null }));
jest.mock('lucide-react-native', () => ({ ShieldCheck: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

describe('login configuration state', () => {
  it('explains a missing Google configuration and disables the CTA', async () => {
    await render(<LoginScreen />);

    expect(screen.getByTestId('auth-config-warning')).toBeTruthy();
    expect(
      screen.getByTestId('google-sign-in-button').props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });
});
