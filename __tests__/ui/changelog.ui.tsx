/// <reference types="jest" />
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import ChangelogScreen from '../../app/changelog';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/hooks/use-changelog', () => ({
  useChangelog: () => ({
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    data: [
      {
        version: '1.4.0',
        notes: '## Features\n\n* **reports:** search descriptions',
        publishedAt: '2026-11-01T10:00:00.000Z',
        url: 'https://github.com/example/releases/v1.4.0',
      },
      {
        version: '1.3.0',
        notes: '',
        publishedAt: null,
        url: 'https://github.com/example/releases/v1.3.0',
      },
    ],
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
jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

describe('changelog screen', () => {
  it('renders release notes and links to GitHub', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<ChangelogScreen />);

    expect(screen.getByText('v1.4.0')).toBeTruthy();
    expect(screen.getByText('Latest')).toBeTruthy();
    expect(screen.getByText('Features')).toBeTruthy();
    expect(screen.getByText('reports:')).toBeTruthy();
    expect(screen.getByText('No notes for this release.')).toBeTruthy();

    await fireEvent.press(screen.getAllByLabelText('View on GitHub')[0]!);
    expect(open).toHaveBeenCalledWith(
      'https://github.com/example/releases/v1.4.0',
    );
  });
});
