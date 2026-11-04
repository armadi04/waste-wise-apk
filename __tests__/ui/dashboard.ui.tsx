/// <reference types="jest" />
import { fireEvent, render, screen } from '@testing-library/react-native';

import DashboardScreen from '../../app/(tabs)/index';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return { useRouter: () => router, __router: router };
});

jest.mock('@/auth/auth-provider', () => ({
  useAuth: () => ({ user: { fullname: 'Explore Crawl', avatar: null } }),
}));

jest.mock('@/hooks/use-reports', () => ({
  useReportStats: () => ({
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    data: {
      total: 12,
      pending: 3,
      inProgress: 2,
      completed: 6,
      rejected: 1,
      recentReports: [],
    },
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
jest.mock('lottie-react-native', () => () => null);
jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const router = (
  jest.requireMock('expo-router') as { __router: { push: jest.Mock } }
).__router;

describe('dashboard screen', () => {
  beforeEach(() => router.push.mockReset());

  it('shows the total and a single report CTA', async () => {
    await render(<DashboardScreen />);
    expect(screen.getByText('Total reports')).toBeTruthy();
    expect(screen.getByLabelText('12 total reports')).toBeTruthy();
    expect(screen.getByText('No reports yet')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Report waste'));
    expect(router.push).toHaveBeenCalledWith('/reports/create');
  });

  it('deep-links a status row into the filtered reports list', async () => {
    await render(<DashboardScreen />);
    fireEvent.press(screen.getByLabelText('Pending: 3 reports'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reports',
      params: { status: 'PENDING' },
    });
  });
});
