/// <reference types="jest" />
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import EditProfileScreen from '../../app/profile/edit';

jest.mock('expo-router', () => {
  const nav = {
    router: { back: jest.fn() },
    prevent: false,
    callback: null as unknown,
    disable: jest.fn(),
  };
  return {
    useRouter: () => nav.router,
    usePreventRemove: (prevent: boolean, callback: unknown) => {
      nav.prevent = prevent;
      nav.callback = callback;
      return nav.disable;
    },
    __nav: nav,
  };
});

jest.mock('@/auth/auth-provider', () => {
  const auth = {
    user: {
      id: 7,
      fullname: 'Explore',
      email: 'explore@example.com',
      phone: null,
      avatar: null,
    },
    reloadProfile: jest.fn(async () => undefined),
  };
  return { useAuth: () => auth, __auth: auth };
});

jest.mock('@/hooks/use-profile', () => {
  const save = { mutateAsync: jest.fn(), isPending: false };
  return {
    useSaveProfile: () => save,
    useTimeZoneConfig: () => ({
      data: {
        defaultTimeZone: 'Asia/Jakarta',
        businessTimeZones: ['Asia/Jakarta', 'Asia/Makassar'],
      },
    }),
    useTimeZonePreference: () => ({
      isLoading: false,
      data: { timeZone: null, lastDetectedTimeZone: null },
    }),
    __save: save,
  };
});

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('@/lib/image', () => ({ prepareReportImage: jest.fn() }));

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

const nav = (
  jest.requireMock('expo-router') as {
    __nav: {
      router: { back: jest.Mock };
      prevent: boolean;
      callback: null | ((o: { repeat: () => void }) => void);
      disable: jest.Mock;
    };
  }
).__nav;
const save = (
  jest.requireMock('@/hooks/use-profile') as {
    __save: { mutateAsync: jest.Mock };
  }
).__save;
const auth = (
  jest.requireMock('@/auth/auth-provider') as {
    __auth: { reloadProfile: jest.Mock };
  }
).__auth;

describe('edit profile screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nav.prevent = false;
    save.mutateAsync.mockResolvedValue({});
  });

  it('saves name and phone, then refreshes the profile', async () => {
    await render(<EditProfileScreen />);
    expect(
      screen.getByLabelText('Save changes').props.accessibilityState,
    ).toMatchObject({ disabled: true });

    await fireEvent.changeText(
      screen.getByLabelText('Full name'),
      'Explore Crawl',
    );
    await fireEvent.changeText(
      screen.getByLabelText('Phone'),
      '+62 812 345 678',
    );
    await fireEvent.press(screen.getByLabelText('Save changes'));

    await waitFor(() => expect(nav.router.back).toHaveBeenCalled());
    expect(save.mutateAsync).toHaveBeenCalledWith({
      profile: {
        fullname: 'Explore Crawl',
        phone: '+62 812 345 678',
        avatar: null,
      },
      timeZone: undefined,
    });
    expect(auth.reloadProfile).toHaveBeenCalled();
    expect(nav.disable).toHaveBeenCalled();
  });

  it('rejects an invalid phone number', async () => {
    await render(<EditProfileScreen />);
    await fireEvent.changeText(screen.getByLabelText('Phone'), 'call me');
    await fireEvent.press(screen.getByLabelText('Save changes'));
    expect(
      await screen.findByText(
        'Use digits, spaces or dashes, optionally starting with +',
      ),
    ).toBeTruthy();
    expect(save.mutateAsync).not.toHaveBeenCalled();
  });

  it('sends a changed time zone', async () => {
    await render(<EditProfileScreen />);
    await fireEvent.press(screen.getByLabelText(/^Time zone/));
    await fireEvent.press(
      screen.getByRole('radio', { name: 'Asia/Makassar'.replace('_', ' ') }),
    );
    await fireEvent.press(screen.getByLabelText('Save changes'));

    await waitFor(() => expect(save.mutateAsync).toHaveBeenCalled());
    expect(save.mutateAsync.mock.lastCall?.[0].timeZone).toMatchObject({
      timeZone: 'Asia/Makassar',
    });
  });

  it('asks before discarding unsaved edits', async () => {
    await render(<EditProfileScreen />);
    expect(nav.prevent).toBe(false);
    await fireEvent.changeText(screen.getByLabelText('Full name'), 'Someone');
    expect(nav.prevent).toBe(true);

    const repeat = jest.fn();
    await act(async () => nav.callback?.({ repeat }));
    expect(screen.getByText('Discard changes?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Discard'));
    expect(repeat).toHaveBeenCalled();
  });
});
