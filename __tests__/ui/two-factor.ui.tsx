/// <reference types="jest" />
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import TwoFactorScreen from '../../app/(auth)/two-factor';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return {
    useRouter: () => router,
    Redirect: () => null,
    __router: router,
  };
});

jest.mock('@/auth/auth-provider', () => {
  const state = {
    status: 'guest',
    isTwoFactorPending: true,
    isVerifyingTwoFactor: false,
    verifyTwoFactor: jest.fn(),
    cancelTwoFactor: jest.fn(),
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

jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

const authState = (
  jest.requireMock('@/auth/auth-provider') as {
    __authState: {
      status: string;
      isTwoFactorPending: boolean;
      isVerifyingTwoFactor: boolean;
      verifyTwoFactor: jest.Mock;
      cancelTwoFactor: jest.Mock;
    };
  }
).__authState;

const router = (
  jest.requireMock('expo-router') as {
    __router: { push: jest.Mock; replace: jest.Mock };
  }
).__router;

describe('two-factor screen', () => {
  beforeEach(() => {
    authState.status = 'guest';
    authState.isTwoFactorPending = true;
    authState.isVerifyingTwoFactor = false;
    authState.verifyTwoFactor.mockReset();
    authState.cancelTwoFactor.mockReset();
    router.push.mockReset();
    router.replace.mockReset();
  });

  it('renders the code form', async () => {
    await render(<TwoFactorScreen />);

    expect(screen.getByText('Verify it’s you')).toBeTruthy();
    expect(screen.getByText('Authentication code')).toBeTruthy();
    expect(screen.getByText('Verify code')).toBeTruthy();
  });

  it('validates a short code before submitting', async () => {
    await render(<TwoFactorScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('two-factor-submit'));
    });

    expect(
      await screen.findByText('Enter the 6-digit code or a recovery code'),
    ).toBeTruthy();
    expect(authState.verifyTwoFactor).not.toHaveBeenCalled();
  });

  it('submits a trimmed code and shows verify errors', async () => {
    authState.verifyTwoFactor.mockResolvedValue({
      status: 'error',
      error: {
        code: 'two_factor_invalid_code',
        message: 'That code is not valid. Check the code and try again.',
      },
    });
    await render(<TwoFactorScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByTestId('two-factor-code'), ' 123456 ');
      fireEvent.press(screen.getByTestId('two-factor-submit'));
    });

    await waitFor(() =>
      expect(authState.verifyTwoFactor).toHaveBeenCalledWith('123456'),
    );
    expect(
      await screen.findByText(
        'That code is not valid. Check the code and try again.',
      ),
    ).toBeTruthy();
    expect(screen.getByTestId('two-factor-error')).toBeTruthy();
  });

  it('starts over with another account', async () => {
    await render(<TwoFactorScreen />);

    await act(async () => {
      fireEvent.press(screen.getByText('Use another account'));
    });

    expect(authState.cancelTwoFactor).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/login');
  });
});
