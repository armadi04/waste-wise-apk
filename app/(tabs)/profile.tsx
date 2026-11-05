import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  Bell,
  LogOut,
  MonitorSmartphone,
  Pencil,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import {
  Divider,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui/layout';
import { Segmented } from '@/components/ui/segmented';
import { AppText } from '@/components/ui/text';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { useMySessions } from '@/hooks/use-sessions';
import { useTwoFactorStatus } from '@/hooks/use-two-factor';
import { capitalize } from '@/lib/format';
import { useTheme } from '@/theme';

import type { ThemePreference } from '@/theme';

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ProfileScreen() {
  const { colors, spacing, preference, setPreference } = useTheme();
  const { user, signOut, reloadProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const router = useRouter();
  const unread = useUnreadNotificationCount().data ?? 0;
  const twoFactor = useTwoFactorStatus().data;
  const sessionCount = useMySessions().data?.length;
  const version = Constants.expoConfig?.version;
  const role = user?.roles?.[0]?.name ?? 'user';

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    setSigningOut(true);
    void signOut().finally(() => {
      setSigningOut(false);
      setConfirmingLogout(false);
    });
  };

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader title="Profile" subtitle="Your WasteWise account." />

      <Card style={{ gap: spacing.lg, alignItems: 'center' }}>
        <Avatar media={user?.avatar} name={user?.fullname} size={88} />
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="sectionTitle" style={{ textAlign: 'center' }}>
            {user?.fullname || 'WasteWise user'}
          </AppText>
          <AppText color={colors.mutedForeground}>{user?.email}</AppText>
          <Badge
            label={capitalize(role)}
            tone="info"
            style={{ alignSelf: 'center', marginTop: spacing.xs }}
          />
        </View>
        <View style={{ alignSelf: 'stretch' }}>
          <Divider />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <ShieldCheck size={18} color={colors.success} />
          <AppText color={colors.mutedForeground}>
            Signed in with Google
          </AppText>
        </View>
        <Button
          label="Edit profile"
          variant="outline"
          fullWidth
          icon={<Pencil size={16} color={colors.foreground} />}
          onPress={() => router.push('/profile/edit')}
        />
      </Card>

      <ListGroup title="Account">
        <ListRow
          icon={ShieldCheck}
          title="Security"
          subtitle="Two-factor authentication"
          value={twoFactor ? (twoFactor.enabled ? 'On' : 'Off') : undefined}
          onPress={() => router.push('/profile/security')}
        />
        <ListRow
          icon={MonitorSmartphone}
          title="Sessions"
          subtitle="Devices signed in to your account"
          value={sessionCount ? String(sessionCount) : undefined}
          onPress={() => router.push('/profile/sessions')}
        />
      </ListGroup>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Theme" />
        <Segmented
          options={APPEARANCE_OPTIONS}
          value={preference}
          onChange={(value) => void setPreference(value)}
        />
      </Card>

      <ListGroup title="App">
        <ListRow
          icon={Bell}
          title="Notifications"
          value={unread ? `${unread} new` : undefined}
          onPress={() => router.push('/notifications')}
        />
      </ListGroup>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        <Button
          label="Log out"
          variant="danger-outline"
          fullWidth
          icon={<LogOut size={17} color={colors.danger} />}
          loading={signingOut}
          onPress={() => setConfirmingLogout(true)}
        />
        <AppText
          variant="caption"
          color={colors.mutedForeground}
          style={{ textAlign: 'center' }}
        >
          Logging out ends this device&apos;s session.
        </AppText>
        {version ? (
          <AppText
            variant="caption"
            color={colors.mutedForeground}
            style={{ textAlign: 'center' }}
          >
            WasteWise v{version}
          </AppText>
        ) : null}
      </View>
      <Dialog
        visible={confirmingLogout}
        tone="danger"
        icon={(color) => <LogOut size={26} color={color} />}
        title="Log out?"
        message="You will need to sign in with Google again on this device."
        confirmLabel="Log out"
        loading={signingOut}
        loadingLabel="Logging out…"
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </Screen>
  );
}
