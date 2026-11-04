import { MapPin, MapPinOff } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

export type LocationState = 'idle' | 'loading' | 'ready' | 'error';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function LocationStatus({
  state,
  location,
  error,
  disabled,
  onRefresh,
  onOpenSettings,
}: {
  state: LocationState;
  location: Coordinates | null;
  error: string | null;
  disabled: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const failed = state === 'error' || (state !== 'loading' && !location);

  return (
    <View
      style={{
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: failed ? colors.dangerBorder : colors.borderSubtle,
        backgroundColor: failed ? colors.dangerBackground : colors.surface,
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: failed ? colors.surface : colors.successBackground,
          }}
        >
          {state === 'loading' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : failed ? (
            <MapPinOff size={20} color={colors.danger} />
          ) : (
            <MapPin size={20} color={colors.successForeground} />
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }} accessibilityLiveRegion="polite">
          <AppText
            weight="semibold"
            color={failed ? colors.dangerForeground : colors.foreground}
          >
            {state === 'loading'
              ? 'Getting your location…'
              : failed
                ? 'Location unavailable'
                : 'Location captured'}
          </AppText>
          {state === 'loading' ? null : failed ? (
            <AppText variant="caption" color={colors.dangerForeground}>
              {error ?? 'A GPS location is required to submit a report.'}
            </AppText>
          ) : location ? (
            <AppText
              variant="caption"
              color={colors.mutedForeground}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </AppText>
          ) : null}
        </View>
        {state === 'ready' ? (
          <Button
            label="Refresh"
            variant="ghost"
            onPress={onRefresh}
            disabled={disabled}
          />
        ) : null}
      </View>
      {failed ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Try again"
            variant="outline"
            onPress={onRefresh}
            disabled={disabled}
            style={{ flex: 1 }}
          />
          <Button
            label="Settings"
            variant="ghost"
            onPress={onOpenSettings}
            disabled={disabled}
          />
        </View>
      ) : null}
    </View>
  );
}
