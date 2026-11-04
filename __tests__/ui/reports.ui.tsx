/// <reference types="jest" />
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import ReportsScreen from '../../app/(tabs)/reports';

const mockParams: { status?: string; category?: string } = {};
jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return {
    useRouter: () => router,
    useLocalSearchParams: () => mockParams,
    __router: router,
  };
});

jest.mock('@/hooks/use-reports', () => {
  const state = {
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    data: { pages: [{ data: [] as unknown[], meta: {} }] },
  };
  return {
    useReports: jest.fn(() => state),
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
jest.mock('lottie-react-native', () => () => null);
jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const router = (
  jest.requireMock('expo-router') as { __router: { push: jest.Mock } }
).__router;
const hooks = jest.requireMock('@/hooks/use-reports') as {
  useReports: jest.Mock;
  __state: { data: { pages: { data: unknown[] }[] } };
};

function report(id: number, createdAt: Date) {
  return {
    id,
    description: `Report ${id}`,
    status: 'PENDING',
    predictedCategory: 'PLASTIC_WASTE',
    createdAt: createdAt.toISOString(),
    media: null,
  };
}

function setItems(items: unknown[]) {
  hooks.__state.data = { pages: [{ data: items }] };
}

describe('reports screen', () => {
  beforeEach(() => {
    router.push.mockReset();
    hooks.useReports.mockClear();
    delete mockParams.status;
    delete mockParams.category;
    setItems([]);
  });

  it('preselects the filter from the status param', async () => {
    mockParams.status = 'PENDING';
    await render(<ReportsScreen />);
    expect(
      screen.getByRole('tab', { name: 'Pending, 3', selected: true }),
    ).toBeTruthy();
    expect(screen.getByText('No pending reports')).toBeTruthy();
  });

  it('hides zero counts on filter chips', async () => {
    await render(<ReportsScreen />);
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeTruthy();
    expect(screen.queryByText('Completed · 0')).toBeNull();
  });

  it('resets to All from the filtered empty state', async () => {
    mockParams.status = 'PENDING';
    await render(<ReportsScreen />);
    await fireEvent.press(screen.getByLabelText('Show all'));
    expect(screen.getByText('No reports yet')).toBeTruthy();
  });

  it('leaves new report creation to the tab bar', async () => {
    await render(<ReportsScreen />);
    expect(screen.queryByLabelText('New report')).toBeNull();
  });

  it('groups reports by day and shows the end of the list', async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    setItems([report(2, now), report(1, yesterday)]);
    await render(<ReportsScreen />);

    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Report 2')).toBeTruthy();
    expect(screen.getAllByText('Plastic Waste')).toHaveLength(2);
    expect(screen.getByText("You're all caught up")).toBeTruthy();
  });

  it('debounces the search term and offers to clear it', async () => {
    jest.useFakeTimers();
    try {
      await render(<ReportsScreen />);
      await fireEvent.changeText(
        screen.getByLabelText('Search reports'),
        'bottle',
      );
      expect(hooks.useReports).not.toHaveBeenLastCalledWith(
        'ALL',
        'bottle',
        {},
      );

      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      expect(hooks.useReports).toHaveBeenLastCalledWith('ALL', 'bottle', {});
      expect(screen.getByText('No reports match "bottle"')).toBeTruthy();

      await fireEvent.press(screen.getAllByLabelText('Clear search')[0]!);
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      expect(hooks.useReports).toHaveBeenLastCalledWith('ALL', '', {});
    } finally {
      jest.useRealTimers();
    }
  });

  it('applies a category deep link as an active filter', async () => {
    mockParams.category = 'PAPER_WASTE';
    await render(<ReportsScreen />);

    expect(hooks.useReports).toHaveBeenLastCalledWith('ALL', '', {
      category: 'PAPER_WASTE',
    });
    expect(screen.getByLabelText('Filters, 1 active')).toBeTruthy();
    expect(screen.getByText('No reports match these filters')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Remove filter Paper Waste'));
    expect(hooks.useReports).toHaveBeenLastCalledWith('ALL', '', {});
  });

  it('filters by date range from the sheet', async () => {
    await render(<ReportsScreen />);
    await fireEvent.press(screen.getByLabelText('Filters'));
    expect(screen.getByText('Filter reports')).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Last 7 days' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Organic Waste' }));
    await fireEvent.press(screen.getByLabelText('Apply filters'));

    const filters = hooks.useReports.mock.lastCall?.[2] as Record<
      string,
      string
    >;
    expect(filters.category).toBe('ORGANIC_WASTE');
    expect(filters.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.queryByText('Filter reports')).toBeNull();
    expect(screen.getByLabelText('Filters, 2 active')).toBeTruthy();
  });
});
