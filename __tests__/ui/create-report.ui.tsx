/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import CreateReportScreen from '../../app/reports/create';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
  return { useRouter: () => router, __router: router };
});

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
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
  const mutation = { mutateAsync: jest.fn(), isPending: false };
  return { useCreateReport: () => mutation, __mutation: mutation };
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
  jest.requireMock('expo-router') as {
    __router: { replace: jest.Mock };
  }
).__router;
const location = jest.requireMock('expo-location') as Record<string, jest.Mock>;
const picker = jest.requireMock('expo-image-picker') as Record<
  string,
  jest.Mock
>;
const media = jest.requireMock('@/api/media.api') as {
  uploadMedia: jest.Mock;
};
const mutation = (
  jest.requireMock('@/hooks/use-reports') as {
    __mutation: { mutateAsync: jest.Mock };
  }
).__mutation;

function grantLocation() {
  location.hasServicesEnabledAsync!.mockResolvedValue(true);
  location.requestForegroundPermissionsAsync!.mockResolvedValue({
    granted: true,
  });
  location.getCurrentPositionAsync!.mockResolvedValue({
    coords: { latitude: -7.0155251234567, longitude: 110.4820261234567 },
  });
}

async function pickPhoto() {
  picker.requestCameraPermissionsAsync!.mockResolvedValue({ granted: true });
  picker.launchCameraAsync!.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///raw.jpg' }],
  });
  await fireEvent.press(screen.getByLabelText('Take photo'));
  await waitFor(() =>
    expect(screen.getByLabelText('Photo: done')).toBeTruthy(),
  );
}

describe('create report screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    grantLocation();
  });

  it('captures GPS on entry and explains what is missing', async () => {
    await render(<CreateReportScreen />);

    expect(await screen.findByText('Location captured')).toBeTruthy();
    expect(location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Add a photo to continue.')).toBeTruthy();
    expect(
      screen.getByLabelText('Submit report').props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('shows the location error with recovery actions', async () => {
    location.requestForegroundPermissionsAsync!.mockResolvedValue({
      granted: false,
    });
    await render(<CreateReportScreen />);

    expect(await screen.findByText('Location unavailable')).toBeTruthy();
    expect(screen.getByLabelText('Try again')).toBeTruthy();
    expect(screen.getByLabelText('Settings')).toBeTruthy();
  });

  it('uploads, creates with rounded coordinates, and reuses media on retry', async () => {
    media.uploadMedia.mockResolvedValue({ id: 77 });
    mutation.mutateAsync
      .mockRejectedValueOnce(new Error('Server busy'))
      .mockResolvedValueOnce({ id: 9 });

    await render(<CreateReportScreen />);
    await screen.findByText('Location captured');
    await pickPhoto();
    await fireEvent.changeText(
      screen.getByLabelText('Description'),
      'Plastic bottles by the river',
    );

    await fireEvent.press(screen.getByLabelText('Submit report'));
    expect(await screen.findByText('Server busy')).toBeTruthy();
    expect(mutation.mutateAsync).toHaveBeenCalledWith({
      description: 'Plastic bottles by the river',
      mediaId: 77,
      latitude: -7.015525,
      longitude: 110.482026,
    });

    await fireEvent.press(screen.getByLabelText('Submit report'));
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/reports/[id]',
        params: { id: '9' },
      }),
    );
    expect(media.uploadMedia).toHaveBeenCalledTimes(1);
  });

  it('explains a denied camera permission in a dialog', async () => {
    picker.requestCameraPermissionsAsync!.mockResolvedValue({ granted: false });
    await render(<CreateReportScreen />);
    await screen.findByText('Location captured');

    await fireEvent.press(screen.getByLabelText('Take photo'));
    expect(await screen.findByText('Camera access needed')).toBeTruthy();
    expect(screen.getByLabelText('Open settings')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Not now'));
    expect(screen.queryByText('Camera access needed')).toBeNull();
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });
});
