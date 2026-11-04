import { Image } from 'expo-image';
import { ChevronRight, ImageOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { formatDateTime } from '@/lib/format';
import { mediaViewUrl } from '@/lib/media-url';
import { useTheme } from '@/theme';
import type { Report } from '@/types/domain';

import { CategoryBadge, ReportStatusBadge } from './report-badges';

export function ReportListItem({
  report,
  onPress,
}: {
  report: Report;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const uri = mediaViewUrl(report.media);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${report.id}: ${report.description}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        backgroundColor: pressed ? colors.surfaceHover : colors.surface,
        alignItems: 'center',
      })}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 64, height: 64 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <ImageOff size={22} color={colors.mutedForeground} />
        )}
      </View>

      <View style={{ flex: 1, gap: spacing.xs }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <AppText variant="caption" color={colors.mutedForeground}>
            #{report.id} · {formatDateTime(report.createdAt)}
          </AppText>
          <ReportStatusBadge status={report.status} />
        </View>
        <AppText numberOfLines={2}>{report.description}</AppText>
        <CategoryBadge category={report.predictedCategory} />
      </View>

      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}
