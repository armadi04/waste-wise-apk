import { Camera } from 'lucide-react-native';
import { View } from 'react-native';

import { BrandBackdrop } from '@/components/ui/brand-backdrop';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

export function DashboardHero({
  total,
  onReport,
}: {
  total: number;
  onReport: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.brand,
        borderRadius: radius.xl,
        overflow: 'hidden',
        padding: spacing.xxl,
        gap: spacing.lg,
      }}
    >
      <BrandBackdrop />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label" color={colors.brandMutedForeground}>
          Total reports
        </AppText>
        <AppText
          variant="display"
          color={colors.brandForeground}
          style={{ fontVariant: ['tabular-nums'] }}
          accessibilityLabel={`${total} total reports`}
        >
          {total}
        </AppText>
        <AppText variant="caption" color={colors.brandMutedForeground}>
          Only reports from your account are counted.
        </AppText>
      </View>
      <Button
        label="Report waste"
        variant="inverse"
        icon={<Camera size={18} color={colors.brand} />}
        onPress={onReport}
      />
    </View>
  );
}
