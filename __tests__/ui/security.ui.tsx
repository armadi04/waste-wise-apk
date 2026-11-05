/// <reference types="jest" />
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Linking } from 'react-native';

import SecurityScreen from '../../app/profile/security';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

jest.mock('@/hooks/use-two-factor', () => {
  const m = {
    status: {
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
      data: { enabled: false, recoveryCodesRemaining: 0 },
    },
    setup: { mutateAsync: jest.fn(), isPending: false },
    enable: { mutateAsync: jest.fn(), isPending: false },
    disable: { mutateAsync: jest.fn(), isPending: false },
    regenerate: { mutateAsync: jest.fn(), isPending: false },
  };
  return {
    useTwoFactorStatus: () => m.status,
    useStartTwoFactorSetup: () => m.setup,
    useEnableTwoFactor: () => m.enable,
    useDisableTwoFactor: () => m.disable,
    useRegenerateRecoveryCodes: () => m.regenerate,
    __m: m,
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

type Mutation = { mutateAsync: jest.Mock };
const m = (
  jest.requireMock('@/hooks/use-two-factor') as {
    __m: {
      status: { data: { enabled: boolean; recoveryCodesRemaining: number } };
      setup: Mutation;
      enable: Mutation;
      disable: Mutation;
      regenerate: Mutation;
    };
  }
).__m;

describe('security screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m.status.data = { enabled: false, recoveryCodesRemaining: 0 };
  });

  it('enrolls: setup key, verify code, then shows recovery codes once', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    m.setup.mutateAsync.mockResolvedValue({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUrl: 'otpauth://totp/WasteWise:me?secret=JBSWY3DPEHPK3PXP',
      qrDataUrl: 'data:image/png;base64,AAA',
    });
    m.enable.mutateAsync
      .mockRejectedValueOnce(new Error('That code is not valid'))
      .mockResolvedValueOnce({ recoveryCodes: ['aaaa-bbbb', 'cccc-dddd'] });
    await render(<SecurityScreen />);

    expect(screen.getByText('Off')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Set up two-factor'));
    expect(await screen.findByText('JBSW Y3DP EHPK 3PXP')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Open in authenticator app'));
    expect(open).toHaveBeenCalledWith(
      'otpauth://totp/WasteWise:me?secret=JBSWY3DPEHPK3PXP',
    );

    await fireEvent.changeText(
      screen.getByLabelText('Authentication code'),
      '123456',
    );
    await fireEvent.press(screen.getByLabelText('Verify and turn on'));
    expect(await screen.findByText('That code is not valid')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Verify and turn on'));
    expect(await screen.findByText('Save your recovery codes')).toBeTruthy();
    expect(screen.getByText('aaaa-bbbb')).toBeTruthy();
    expect(m.enable.mutateAsync).toHaveBeenLastCalledWith('123456');

    await fireEvent.press(screen.getByLabelText("I've saved these codes"));
    expect(screen.queryByText('aaaa-bbbb')).toBeNull();
  });

  it('warns when no authenticator app can open the setup link', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
    m.setup.mutateAsync.mockResolvedValue({
      secret: 'ABCD',
      otpauthUrl: 'otpauth://x',
      qrDataUrl: 'data:image/png;base64,AAA',
    });
    await render(<SecurityScreen />);
    await fireEvent.press(screen.getByLabelText('Set up two-factor'));
    await fireEvent.press(
      await screen.findByLabelText('Open in authenticator app'),
    );
    expect(await screen.findByText(/No authenticator app opened/)).toBeTruthy();
  });

  it('requires a code to turn two-factor off', async () => {
    m.status.data = { enabled: true, recoveryCodesRemaining: 7 };
    m.disable.mutateAsync.mockResolvedValue(undefined);
    await render(<SecurityScreen />);

    expect(screen.getByText('7 recovery codes left')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Turn off two-factor'));
    await fireEvent.press(screen.getByLabelText('Turn off'));
    expect(
      await screen.findByText('Enter the 6-digit code or a recovery code'),
    ).toBeTruthy();
    expect(m.disable.mutateAsync).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByLabelText('Authentication code'),
      '654321',
    );
    await fireEvent.press(screen.getByLabelText('Turn off'));
    await waitFor(() =>
      expect(m.disable.mutateAsync).toHaveBeenCalledWith('654321'),
    );
    await waitFor(() =>
      expect(screen.queryByText('Turn off two-factor?')).toBeNull(),
    );
  });

  it('replaces recovery codes after confirming a code', async () => {
    m.status.data = { enabled: true, recoveryCodesRemaining: 1 };
    m.regenerate.mutateAsync.mockResolvedValue({ recoveryCodes: ['new-1'] });
    await render(<SecurityScreen />);

    await fireEvent.press(screen.getByLabelText('New recovery codes'));
    await fireEvent.changeText(
      screen.getByLabelText('Authentication code'),
      '111222',
    );
    await fireEvent.press(screen.getByLabelText('Replace codes'));
    expect((await screen.findAllByText('new-1')).length).toBeGreaterThan(0);
  });
});
