/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import EditReportScreen from '../../app/reports/[id]/edit';

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

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  hasServicesEnabledAsync: jest.fn(async () => true),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -6.1234567891, longitude: 106.9876543219 },
  })),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///new.jpg' }],
  })),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/lib/image', () => ({
  prepareReportImage: jest.fn(async () => ({
    uri: 'file:///prepared.jpg',
    name: 'report.jpg',
    type: 'image/jpeg',
  })),
}));

jest.mock('@/api/media.api', () => ({ uploadMedia: jest.fn() }));

jest.mock('@/hooks/use-reports', () => {
  const state = {
    detail: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      data: null as unknown,
    },
    update: { mutateAsync: jest.fn(), isPending: false },
  };
  return {
    useReportDetail: () => state.detail,
    useUpdateReport: () => state.update,
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
  jest.requireMock('expo-router') as { __router: { back: jest.Mock } }
).__router;
const state = (
  jest.requireMock('@/hooks/use-reports') as {
    __state: {
      detail: { data: unknown };
      update: { mutateAsync: jest.Mock };
    };
  }
).__state;
const media = jest.requireMock('@/api/media.api') as {
  uploadMedia: jest.Mock;
};

describe('edit report screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.detail.data = makeReport();
  });

  it('refuses to edit a report that is no longer pending', async () => {
    state.detail.data = makeReport({ status: 'COMPLETED' });
    await render(<EditReportScreen />);
    expect(
      screen.getByText('Only Pending reports you created can be edited.'),
    ).toBeTruthy();
  });

  it('saves text and keeps the current photo without uploading', async () => {
    state.update.mutateAsync.mockResolvedValue(makeReport());
    await render(<EditReportScreen />);

    expect(screen.getByDisplayValue('Bottles near the river')).toBeTruthy();
    await fireEvent.changeText(
      screen.getByLabelText('Description'),
      'Bottles and cans near the river',
    );
    await fireEvent.press(screen.getByLabelText('Save changes'));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(media.uploadMedia).not.toHaveBeenCalled();
    expect(state.update.mutateAsync).toHaveBeenCalledWith({
      description: 'Bottles and cans near the river',
      latitude: -7.01,
      longitude: 110.48,
    });
  });

  it('uploads a replacement photo once and reuses it on retry', async () => {
    media.uploadMedia.mockResolvedValue({ id: 42 });
    state.update.mutateAsync
      .mockRejectedValueOnce(new Error('Server busy'))
      .mockResolvedValueOnce(makeReport());
    await render(<EditReportScreen />);

    await fireEvent.press(screen.getByLabelText('Retake photo'));
    await waitFor(() =>
      expect(screen.getByLabelText('Remove selected photo')).toBeTruthy(),
    );
    await fireEvent.press(screen.getByLabelText('Refresh'));
    await waitFor(() =>
      expect(screen.getByText('-6.123457, 106.987654')).toBeTruthy(),
    );

    await fireEvent.press(screen.getByLabelText('Save changes'));
    expect(await screen.findByText('Server busy')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Save changes'));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(media.uploadMedia).toHaveBeenCalledTimes(1);
    expect(state.update.mutateAsync).toHaveBeenLastCalledWith({
      description: 'Bottles near the river',
      latitude: -6.123457,
      longitude: 106.987654,
      mediaId: 42,
    });
  });
});
