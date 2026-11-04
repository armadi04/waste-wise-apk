/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import SessionsScreen from '../../app/profile/sessions';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

jest.mock('@/hooks/use-sessions', () => {
  const m = {
    list: {
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
      data: [] as unknown[],
    },
    revoke: { mutateAsync: jest.fn(), isPending: false, variables: undefined },
    revokeOthers: { mutateAsync: jest.fn(), isPending: false },
  };
  return {
    useMySessions: () => m.list,
    useRevokeSession: () => m.revoke,
    useRevokeOtherSessions: () => m.revokeOthers,
    __m: m,
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

const m = (
  jest.requireMock('@/hooks/use-sessions') as {
    __m: {
      list: { data: unknown[] };
      revoke: { mutateAsync: jest.Mock };
      revokeOthers: { mutateAsync: jest.Mock };
    };
  }
).__m;

const now = new Date().toISOString();
const session = (id: number, userAgent: string, isCurrent: boolean) => ({
  id,
  sessionId: `s${id}`,
  userId: 7,
  ipAddress: '10.0.0.' + id,
  userAgent,
  impersonatedById: null,
  isSso: false,
  audience: 'admin',
  lastActiveAt: now,
  expiresAt: now,
  absoluteExpiresAt: now,
  revokedAt: null,
  createdAt: now,
  updatedAt: now,
  isCurrent,
});

describe('sessions screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m.list.data = [
      session(1, 'okhttp/4.12.0', true),
      session(
        2,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36',
        false,
      ),
    ];
  });

  it('labels devices and protects the current one', async () => {
    await render(<SessionsScreen />);
    expect(screen.getByText('WasteWise Android app')).toBeTruthy();
    expect(screen.getByText('This device')).toBeTruthy();
    expect(screen.getByText('Chrome on Windows')).toBeTruthy();
    expect(
      screen.queryByLabelText('Sign out WasteWise Android app'),
    ).toBeNull();
  });

  it('signs out a single other device', async () => {
    m.revoke.mutateAsync.mockResolvedValue(undefined);
    await render(<SessionsScreen />);
    await fireEvent.press(screen.getByLabelText('Sign out Chrome on Windows'));
    expect(m.revoke.mutateAsync).toHaveBeenCalledWith(2);
  });

  it('confirms before signing out every other device', async () => {
    m.revokeOthers.mutateAsync.mockResolvedValue({ revoked: 1 });
    await render(<SessionsScreen />);
    await fireEvent.press(screen.getByLabelText('Sign out other devices'));
    expect(screen.getByText('Sign out other devices?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Sign out others'));
    await waitFor(() => expect(m.revokeOthers.mutateAsync).toHaveBeenCalled());
  });

  it('says when this is the only device', async () => {
    m.list.data = [session(1, 'okhttp/4.12.0', true)];
    await render(<SessionsScreen />);
    expect(screen.getByText('This is the only device signed in.')).toBeTruthy();
  });
});
