import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/layout';
import { Segmented } from '@/components/ui/segmented';
import { AppText } from '@/components/ui/text';
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

  const role = user?.roles?.[0]?.name ?? 'user';

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in with Google again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          setSigningOut(true);
          void signOut().finally(() => setSigningOut(false));
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title="Profile"
        subtitle="Your WasteWise account."
        right={
          <Button
            label="Refresh"
            variant="outline"
            icon={<RefreshCw size={16} color={colors.foreground} />}
            loading={refreshing}
            onPress={() => void handleRefresh()}
          />
        }
      />

      <Card style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Avatar media={user?.avatar} name={user?.fullname} size={72} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="sectionTitle">
              {user?.fullname || 'WasteWise user'}
            </AppText>
            <AppText color={colors.mutedForeground}>{user?.email}</AppText>
            <View
              style={{
                alignSelf: 'flex-start',
                marginTop: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: 999,
                backgroundColor: colors.selectedBackground,
              }}
            >
              <AppText variant="caption" color={colors.selectedForeground} weight="semibold">
                {role}
              </AppText>
            </View>
          </View>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <ShieldCheck size={18} color={colors.success} />
          <AppText color={colors.mutedForeground}>
            Signed in with Google · account managed by WasteWise backend
          </AppText>
        </View>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Appearance" />
        <AppText color={colors.mutedForeground}>
          Choose how WasteWise looks on this device.
        </AppText>
        <Segmented
          options={APPEARANCE_OPTIONS}
          value={preference}
          onChange={(value) => void setPreference(value)}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Session" />
        <AppText color={colors.mutedForeground}>
          Logging out revokes this device session on the server.
        </AppText>
        <Button
          label="Log out"
          variant="danger"
          icon={<LogOut size={17} color={colors.primaryForeground} />}
          loading={signingOut}
          onPress={handleLogout}
        />
      </Card>
    </Screen>
  );
}
