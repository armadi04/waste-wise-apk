/// <reference types="jest" />
import { fireEvent, render, screen } from '@testing-library/react-native';

import ReportsScreen from '../../app/(tabs)/reports';

const mockParams: { status?: string } = {};
jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return {
    useRouter: () => router,
    useLocalSearchParams: () => mockParams,
    __router: router,
  };
});

jest.mock('@/hooks/use-reports', () => {
  const empty = {
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    data: { pages: [{ data: [], meta: { total: 0, page: 1, lastPage: 1 } }] },
  };
  return {
    useReports: () => empty,
    useReportStats: () => ({
      data: {
        total: 4,
        pending: 3,
        inProgress: 1,
        completed: 0,
        rejected: 0,
        recentReports: [],
      },
    }),
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
jest.mock('lottie-react-native', () => () => null);
jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const router = (
  jest.requireMock('expo-router') as { __router: { push: jest.Mock } }
).__router;

describe('reports screen', () => {
  beforeEach(() => {
    router.push.mockReset();
    delete mockParams.status;
  });

  it('preselects the filter from the status param', async () => {
    mockParams.status = 'PENDING';
    await render(<ReportsScreen />);
    expect(
      screen.getByRole('tab', { name: 'Pending, 3', selected: true }),
    ).toBeTruthy();
    expect(screen.getByText('No pending reports')).toBeTruthy();
  });

  it('resets to All from the filtered empty state', async () => {
    mockParams.status = 'PENDING';
    await render(<ReportsScreen />);
    await fireEvent.press(screen.getByLabelText('Show all'));
    expect(screen.getByText('No reports yet')).toBeTruthy();
  });

  it('opens the create screen from the FAB', async () => {
    await render(<ReportsScreen />);
    await fireEvent.press(screen.getByLabelText('New report'));
    expect(router.push).toHaveBeenCalledWith('/reports/create');
  });
});
