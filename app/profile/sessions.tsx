import { useRouter } from 'expo-router';
import {
  Globe,
  LogOut,
  Monitor,
  Smartphone,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { InlineAlert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import {
  useMySessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from '@/hooks/use-sessions';
import { formatRelativeTime } from '@/lib/format';
import {
  audienceLabel,
  describeUserAgent,
  type DeviceInfo,
} from '@/lib/user-agent';
import { useTheme } from '@/theme';
import type { OwnSession } from '@/types/domain';

const DEVICE_ICON: Record<DeviceInfo['kind'], LucideIcon> = {
  'mobile-app': Smartphone,
  phone: Smartphone,
  desktop: Monitor,
  unknown: Globe,
};

function SessionRow({
  session,
  revoking,
  onRevoke,
}: {
  session: OwnSession;
  revoking: boolean;
  onRevoke: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const device = describeUserAgent(session.userAgent);
  const Icon = DEVICE_ICON[device.kind];
  const lastActive = formatRelativeTime(session.lastActiveAt);
  const meta = [
    device.system,
    session.ipAddress,
    `Active ${lastActive.toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      accessible={session.isCurrent}
      accessibilityLabel={
        session.isCurrent
          ? `${device.label}, ${audienceLabel(session.audience)}, this device. ${meta}`
          : undefined
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: session.isCurrent
          ? colors.selectedBorder
          : colors.borderSubtle,
        backgroundColor: colors.surface,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.muted,
        }}
      >
        <Icon size={20} color={colors.foreground} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          <AppText weight="semibold">{device.label}</AppText>
          <Badge label={audienceLabel(session.audience)} />
          {session.isCurrent ? (
            <Badge label="This device" tone="success" dot />
          ) : null}
        </View>
        <AppText variant="caption" color={colors.mutedForeground}>
          {meta}
        </AppText>
      </View>
      {session.isCurrent ? null : (
        <Button
          label="Sign out"
          variant="ghost"
          loading={revoking}
          accessibilityLabel={`Sign out ${device.label}`}
          onPress={onRevoke}
        />
      )}
    </View>
  );
}

export default function SessionsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const sessions = useMySessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const [confirmOthers, setConfirmOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = sessions.data ?? [];
  const others = list.filter((session) => !session.isCurrent).length;

  const revokeOne = async (id: number) => {
    setError(null);
    try {
      await revoke.mutateAsync(id);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  const revokeRest = async () => {
    setError(null);
    try {
      await revokeOthers.mutateAsync();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setConfirmOthers(false);
    }
  };

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={sessions.isRefetching}
          onRefresh={() => void sessions.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader
        title="Sessions"
        subtitle="Devices that are signed in to your account."
        onBack={() => router.back()}
      />
      {error ? <InlineAlert message={error} testID="sessions-error" /> : null}
      {sessions.isLoading ? (
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={72} />
          <Skeleton height={72} />
        </View>
      ) : sessions.isError ? (
        <ErrorState
          message={errorMessage(sessions.error)}
          onRetry={() => void sessions.refetch()}
        />
      ) : (
        <>
          <View style={{ gap: spacing.sm }}>
            {list.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                revoking={revoke.isPending && revoke.variables === session.id}
                onRevoke={() => void revokeOne(session.id)}
              />
            ))}
          </View>
          {others > 0 ? (
            <Button
              label="Sign out other devices"
              variant="danger-outline"
              fullWidth
              icon={<LogOut size={16} color={colors.danger} />}
              onPress={() => setConfirmOthers(true)}
            />
          ) : (
            <AppText
              variant="caption"
              color={colors.mutedForeground}
              style={{ textAlign: 'center' }}
            >
              This is the only device signed in.
            </AppText>
          )}
        </>
      )}
      <Dialog
        visible={confirmOthers}
        tone="danger"
        icon={(color) => <LogOut size={26} color={color} />}
        title="Sign out other devices?"
        message={`${others} other ${others === 1 ? 'session' : 'sessions'} will need to sign in again. This device stays signed in.`}
        confirmLabel="Sign out others"
        loading={revokeOthers.isPending}
        loadingLabel="Signing out…"
        onConfirm={() => void revokeRest()}
        onCancel={() => setConfirmOthers(false)}
      />
    </Screen>
  );
}
