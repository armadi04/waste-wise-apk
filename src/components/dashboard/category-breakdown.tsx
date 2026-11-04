import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import {
  CATEGORY_ICON,
  UNCLASSIFIED_ICON,
} from '@/components/reports/report-badges';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import {
  categoryColor,
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABEL,
} from '@/lib/reports';
import { useTheme } from '@/theme';
import type { ReportStats, WasteCategory } from '@/types/domain';

const COUNT_KEY: Record<WasteCategory, keyof ReportStats['byCategory']> = {
  ORGANIC_WASTE: 'organic',
  PLASTIC_WASTE: 'plastic',
  PAPER_WASTE: 'paper',
};

export function CategoryBreakdown({
  stats,
  onSelect,
}: {
  stats: ReportStats;
  onSelect: (category: WasteCategory) => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const rows = [
    ...WASTE_CATEGORIES.map((category) => ({
      key: category as string,
      category: category as WasteCategory | null,
      label: WASTE_CATEGORY_LABEL[category],
      count: stats.byCategory[COUNT_KEY[category]] ?? 0,
      Icon: CATEGORY_ICON[category],
    })),
    {
      key: 'UNCLASSIFIED',
      category: null,
      label: 'Unclassified',
      count: stats.byCategory.unclassified ?? 0,
      Icon: UNCLASSIFIED_ICON,
    },
  ];
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <Card style={{ gap: spacing.sm }}>
      <SectionHeader title="By category" />
      {rows.map(({ key, category, label, count, Icon }) => {
        const color = categoryColor(colors, category);
        const content = (
          <>
            <Icon size={20} color={color} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: spacing.sm,
                }}
              >
                <AppText>{label}</AppText>
                <AppText
                  weight="semibold"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {count}
                </AppText>
              </View>
              <View
                style={{
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: colors.muted,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${(count / max) * 100}%`,
                    height: '100%',
                    borderRadius: radius.pill,
                    backgroundColor: color,
                  }}
                />
              </View>
            </View>
          </>
        );
        const rowStyle = {
          minHeight: 52,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: spacing.md,
          paddingHorizontal: spacing.xs,
          borderRadius: radius.md,
        };
        if (!category) {
          return (
            <View
              key={key}
              accessible
              accessibilityLabel={`${label}: ${count} reports`}
              style={[rowStyle, { paddingRight: spacing.xl + 2 }]}
            >
              {content}
            </View>
          );
        }
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${count} reports`}
            onPress={() => onSelect(category)}
            style={({ pressed }) => [
              rowStyle,
              {
                backgroundColor: pressed ? colors.surfaceHover : 'transparent',
              },
            ]}
          >
            {content}
            <ChevronRight size={18} color={colors.mutedForeground} />
          </Pressable>
        );
      })}
    </Card>
  );
}
