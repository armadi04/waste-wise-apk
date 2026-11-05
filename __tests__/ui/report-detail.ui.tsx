/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import ReportDetailScreen from '../../app/reports/[id]/index';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
  return {
    useRouter: () => router,
    useLocalSearchParams: () => ({ id: '5' }),
    __router: router,
  };
});

jest.mock('@/auth/auth-provider', () => ({
  useAuth: () => ({ user: { id: 7 } }),
}));

jest.mock('@/hooks/use-reports', () => {
  const state = {
    detail: {
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
      data: null as unknown,
    },
    remove: { mutateAsync: jest.fn(), isPending: false },
  };
  return {
    useReportDetail: () => state.detail,
    useDeleteReport: () => state.remove,
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

function makeReport(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    reporterId: 7,
    status: 'PENDING',
    description: 'Bottles near the river',
    predictedCategory: 'PLASTIC_WASTE',
    classificationStatus: 'COMPLETED',
    classificationError: null,
    confidence: 0.9,
    modelVersion: 'v1',
    latitude: -7.01,
    longitude: 110.48,
    media: { id: 3, url: 'x' },
    mediaId: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const router = (
  jest.requireMock('expo-router') as {
    __router: { push: jest.Mock; replace: jest.Mock };
  }
).__router;
const state = (
  jest.requireMock('@/hooks/use-reports') as {
    __state: {
      detail: { data: unknown };
      remove: { mutateAsync: jest.Mock };
    };
  }
).__state;

describe('report detail actions', () => {
  beforeEach(() => {
    router.push.mockReset();
    router.replace.mockReset();
    state.remove.mutateAsync.mockReset();
  });

  it('hides edit and delete once the report leaves Pending', async () => {
    state.detail.data = makeReport({ status: 'IN_PROGRESS' });
    await render(<ReportDetailScreen />);
    expect(screen.queryByLabelText('Edit')).toBeNull();
    expect(screen.queryByLabelText('Delete')).toBeNull();
  });

  it('hides actions on reports owned by someone else', async () => {
    state.detail.data = makeReport({ reporterId: 99 });
    await render(<ReportDetailScreen />);
    expect(screen.queryByLabelText('Edit')).toBeNull();
  });

  it('opens the edit screen for a pending own report', async () => {
    state.detail.data = makeReport();
    await render(<ReportDetailScreen />);
    await fireEvent.press(screen.getByLabelText('Edit'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reports/[id]/edit',
      params: { id: '5' },
    });
  });

  it('confirms deletion before removing and leaving', async () => {
    state.detail.data = makeReport();
    state.remove.mutateAsync.mockResolvedValue(undefined);
    await render(<ReportDetailScreen />);

    await fireEvent.press(screen.getByLabelText('Delete'));
    expect(screen.getByText('Delete this report?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Delete report'));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/reports'),
    );
    expect(state.remove.mutateAsync).toHaveBeenCalledWith(5);
  });

  it('flags a low-confidence classification', async () => {
    state.detail.data = makeReport({ confidence: 0.54 });
    await render(<ReportDetailScreen />);
    expect(screen.getByTestId('low-confidence-note')).toBeTruthy();
  });

  it('does not flag a confident classification', async () => {
    state.detail.data = makeReport({ confidence: 0.9 });
    await render(<ReportDetailScreen />);
    expect(screen.queryByTestId('low-confidence-note')).toBeNull();
  });

  it('does not flag a failed classification with no confidence', async () => {
    state.detail.data = makeReport({
      classificationStatus: 'FAILED',
      classificationError: 'ML_UNAVAILABLE',
      predictedCategory: null,
      confidence: null,
    });
    await render(<ReportDetailScreen />);
    expect(screen.queryByTestId('low-confidence-note')).toBeNull();
  });
});
