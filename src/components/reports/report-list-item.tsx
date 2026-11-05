import { Image } from 'expo-image';
import { ChevronRight, ImageOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/format';
import { mediaViewUrl } from '@/lib/media-url';
import { mediaImageSource } from '@/lib/media-source';
import { REPORT_STATUS_LABEL } from '@/lib/reports';
import { useTheme } from '@/theme';
import type { Report } from '@/types/domain';

import {
  CategoryLabel,
  categoryLabel,
  ReportStatusBadge,
} from './report-badges';

const THUMB = 72;

export function ReportListItem({
  report,
  onPress,
}: {
  report: Report;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const uri = mediaViewUrl(report.media);
  const when = formatRelativeTime(report.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${report.description}. ${REPORT_STATUS_LABEL[report.status]}. ${categoryLabel(report.predictedCategory)}. ${when}.`}
      accessibilityHint="Opens report details"
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
          width: THUMB,
          height: THUMB,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uri ? (
          <Image
            source={mediaImageSource(uri)}
            style={{ width: THUMB, height: THUMB }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <ImageOff size={22} color={colors.mutedForeground} />
        )}
      </View>

      <View style={{ flex: 1, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
          }}
        >
          <AppText weight="medium" numberOfLines={2} style={{ flex: 1 }}>
            {report.description}
          </AppText>
          <ReportStatusBadge status={report.status} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: spacing.sm,
            rowGap: 2,
          }}
        >
          <CategoryLabel category={report.predictedCategory} />
          <AppText variant="caption" color={colors.mutedForeground}>
            · {when} · #{report.id}
          </AppText>
        </View>
      </View>

      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}
