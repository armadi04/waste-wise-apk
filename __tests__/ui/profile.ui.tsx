/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import ProfileScreen from '../../app/(tabs)/profile';

jest.mock('@/auth/auth-provider', () => {
  const state = {
    user: {
      fullname: 'Explore',
      email: 'explore@example.com',
      avatar: null,
      roles: [{ name: 'user' }],
    },
    signOut: jest.fn().mockResolvedValue(undefined),
    reloadProfile: jest.fn().mockResolvedValue(undefined),
  };
  return { useAuth: () => state, __state: state };
});
jest.mock('expo-router', () => {
  const router = { push: jest.fn() };
  return { useRouter: () => router, __router: router };
});
jest.mock('@/hooks/use-notifications', () => ({
  useUnreadNotificationCount: () => ({ data: 2 }),
}));
jest.mock('@/hooks/use-two-factor', () => ({
  useTwoFactorStatus: () => ({
    data: { enabled: true, recoveryCodesRemaining: 8 },
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

  it('confirms in a themed dialog before logging out', async () => {
    const auth = (
      jest.requireMock('@/auth/auth-provider') as {
        __state: { signOut: jest.Mock };
      }
    ).__state;
    auth.signOut.mockClear();
    await render(<ProfileScreen />);

    expect(screen.queryByText('Log out?')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Log out'));
    expect(screen.getByText('Log out?')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Cancel'));
    expect(screen.queryByText('Log out?')).toBeNull();
    expect(auth.signOut).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Log out'));
    const confirm = screen.getAllByLabelText('Log out');
    await fireEvent.press(confirm[confirm.length - 1]!);
    await waitFor(() => expect(auth.signOut).toHaveBeenCalledTimes(1));
  });

  it('links to account and app pages', async () => {
    const router = (
      jest.requireMock('expo-router') as { __router: { push: jest.Mock } }
    ).__router;
    await render(<ProfileScreen />);

    for (const [label, route] of [
      ['Edit profile', '/profile/edit'],
      ['Security, Two-factor authentication, On', '/profile/security'],
      ['Sessions, Devices signed in to your account', '/profile/sessions'],
      ['Notifications, 2 new', '/notifications'],
      ["What's new, v1.2.3", '/changelog'],
    ] as const) {
      await fireEvent.press(screen.getByLabelText(label));
      expect(router.push).toHaveBeenLastCalledWith(route);
    }
  });
});
