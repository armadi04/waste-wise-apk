/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import LoginScreen from '../../app/(auth)/login';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return {
    useRouter: () => router,
    __router: router,
  };
});

jest.mock('@/auth/auth-provider', () => {
  const state = {
    isSigningIn: false,
    signInWithGoogle: jest.fn(),
  };
  return {
    useAuth: () => state,
    __authState: state,
  };
});

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

jest.mock('@/lib/config', () => ({ IS_GOOGLE_CONFIGURED: true }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('@/components/ui/google-icon', () => ({ GoogleIcon: () => null }));
jest.mock('lucide-react-native', () => ({ ShieldCheck: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

const authState = (
  jest.requireMock('@/auth/auth-provider') as {
    __authState: {
      isSigningIn: boolean;
      signInWithGoogle: jest.Mock;
    };
  }
).__authState;

const router = (
  jest.requireMock('expo-router') as {
    __router: { push: jest.Mock; replace: jest.Mock };
  }
).__router;

describe('login screen', () => {
  beforeEach(() => {
    authState.isSigningIn = false;
    authState.signInWithGoogle.mockReset();
    router.push.mockReset();
    router.replace.mockReset();
  });

  it('renders one Google CTA without a register toggle', async () => {
    await render(<LoginScreen />);

    expect(screen.getByText('Welcome to WasteWise')).toBeTruthy();
    expect(screen.getByText('REPORT · CLASSIFY · MANAGE')).toBeTruthy();
    expect(screen.getByTestId('auth-logo')).toBeTruthy();
    expect(screen.getByText('Continue with Google')).toBeTruthy();
    expect(
      screen.getByText(
        'No password needed. New accounts are created automatically on first sign-in.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Sign in to continue')).toBeNull();
    expect(
      screen.getByTestId('auth-illustration', { includeHiddenElements: true })
        .props.importantForAccessibility,
    ).toBe('no-hide-descendants');
    expect(screen.queryByText('Sign up')).toBeNull();
    expect(screen.queryByText('Log In')).toBeNull();
  });

  it('starts Google sign-in from the CTA', async () => {
    authState.signInWithGoogle.mockResolvedValue({ status: 'cancelled' });
    await render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(authState.signInWithGoogle).toHaveBeenCalledTimes(1),
    );
  });

  it('opens the two-factor screen when a challenge is required', async () => {
    authState.signInWithGoogle.mockResolvedValue({
      status: 'two-factor-required',
    });
    await render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/two-factor'),
    );
  });

  it('shows sign-in errors in an accessible alert', async () => {
    authState.signInWithGoogle.mockResolvedValue({
      status: 'error',
      error: {
        code: 'network',
        message: 'Check your connection and try again.',
      },
    });
    await render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    expect(
      await screen.findByText('Check your connection and try again.'),
    ).toBeTruthy();
    const alert = screen.getByTestId('auth-error');
    expect(alert.props.accessibilityRole).toBe('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('polite');
  });

  it('announces the loading state', async () => {
    const view = await render(<LoginScreen />);

    authState.isSigningIn = true;
    await view.rerender(<LoginScreen />);

    expect(screen.getByText('Signing in…')).toBeTruthy();
    expect(
      screen.getByTestId('google-sign-in-button').props.accessibilityState,
    ).toMatchObject({ busy: true });
  });
});
