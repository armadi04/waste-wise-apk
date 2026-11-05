/// <reference types="jest" />
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';

import {
  FloatingTabBar,
  type FloatingTabBarProps,
} from '@/components/navigation/floating-tab-bar';

jest.mock('expo-router', () => {
  const router = { push: jest.fn() };
  return { useRouter: () => router, __router: router };
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

function setup(index = 0) {
  const routes = [
    { key: 'home-key', name: 'index' },
    { key: 'reports-key', name: 'reports' },
    { key: 'profile-key', name: 'profile' },
  ];
  const titles = ['Home', 'My Reports', 'Profile'];
  const descriptors = Object.fromEntries(
    routes.map((route, i) => [
      route.key,
      {
        options: {
          title: titles[i],
          tabBarIcon: () => <Text>icon</Text>,
        },
      },
    ]),
  );
  const emitter = { emit: jest.fn(() => ({ defaultPrevented: false })) };
  const navigateToTab = jest.fn();
  const props = {
    state: { index, routes },
    descriptors,
    emitter,
    navigateToTab,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as FloatingTabBarProps;
  return { props, emitter, navigateToTab };
}

describe('floating tab bar', () => {
  beforeEach(() => router.push.mockReset());

  it('renders every tab and marks the focused one', async () => {
    const { props } = setup(1);
    await render(<FloatingTabBar {...props} />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: 'My Reports', selected: true }),
    ).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: 'Profile', selected: false }),
    ).toBeTruthy();
  });

  it('navigates only when an unfocused tab is pressed', async () => {
    const { props, emitter, navigateToTab } = setup(0);
    await render(<FloatingTabBar {...props} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Home' }));
    expect(navigateToTab).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
    expect(emitter.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'profile-key' }),
    );
    expect(navigateToTab).toHaveBeenCalledWith('profile-key');
  });

  it('respects a prevented tab press', async () => {
    const { props, emitter, navigateToTab } = setup(0);
    emitter.emit.mockReturnValue({ defaultPrevented: true });
    await render(<FloatingTabBar {...props} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('opens create report from the plus button', async () => {
    const { props } = setup(0);
    await render(<FloatingTabBar {...props} />);

    await fireEvent.press(screen.getByLabelText('New report'));
    expect(router.push).toHaveBeenCalledWith('/reports/create');
  });

  it('hides while the keyboard is open', async () => {
    const listeners: Record<string, () => void> = {};
    jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((event, callback) => {
        listeners[event] = callback as () => void;
        return { remove: jest.fn() } as never;
      });
    const { props } = setup(0);
    await render(<FloatingTabBar {...props} />);

    await act(async () => listeners.keyboardDidShow?.());
    expect(screen.queryByLabelText('New report')).toBeNull();

    await act(async () => listeners.keyboardDidHide?.());
    expect(screen.getByLabelText('New report')).toBeTruthy();
  });
});
