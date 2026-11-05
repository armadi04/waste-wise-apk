/// <reference types="jest" />
import { fireEvent, render, screen } from '@testing-library/react-native';

import NotificationsScreen from '../../app/notifications';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), back: jest.fn() };
  return { useRouter: () => router, __router: router };
});

jest.mock('@/hooks/use-notifications', () => {
  const state = {
    list: {
      isLoading: false,
      isError: false,
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      data: { pages: [{ data: [] as unknown[] }] },
    },
    markRead: { mutate: jest.fn() },
    markAll: { mutate: jest.fn(), isPending: false },
  };
  return {
    useNotifications: () => state.list,
    useMarkNotificationRead: () => state.markRead,
    useMarkAllNotificationsRead: () => state.markAll,
    __state: state,
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

const router = (
  jest.requireMock('expo-router') as { __router: { push: jest.Mock } }
).__router;
const state = (
  jest.requireMock('@/hooks/use-notifications') as {
    __state: {
      list: { data: { pages: { data: unknown[] }[] } };
      markRead: { mutate: jest.Mock };
      markAll: { mutate: jest.Mock };
    };
  }
).__state;

const now = new Date().toISOString();

describe('notifications screen', () => {
  beforeEach(() => {
    router.push.mockReset();
    state.markRead.mutate.mockReset();
    state.markAll.mutate.mockReset();
  });

  it('shows an empty state when there is nothing new', async () => {
    state.list.data = { pages: [{ data: [] }] };
    await render(<NotificationsScreen />);
    expect(screen.getByText("You're all caught up")).toBeTruthy();
    expect(screen.queryByLabelText('Mark all read')).toBeNull();
  });

  it('marks an unread item read and opens its report', async () => {
    state.list.data = {
      pages: [
        {
          data: [
            {
              id: 1,
              title: 'Report updated',
              message: 'Report #12 is in progress',
              type: 'info',
              isRead: false,
              link: '/reports/12',
              createdAt: now,
            },
            {
              id: 2,
              title: 'Maintenance',
              message: 'Short downtime tonight',
              type: 'warning',
              isRead: true,
              link: null,
              createdAt: now,
            },
          ],
        },
      ],
    };
    await render(<NotificationsScreen />);
    expect(screen.getByText('Today')).toBeTruthy();

    await fireEvent.press(screen.getByText('Report updated'));
    expect(state.markRead.mutate).toHaveBeenCalledWith(1);
    expect(router.push).toHaveBeenCalledWith('/reports/12');

    await fireEvent.press(screen.getByText('Maintenance'));
    expect(state.markRead.mutate).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByLabelText('Mark all read'));
    expect(state.markAll.mutate).toHaveBeenCalled();
  });
});
