import {
  CircleHelp,
  CupSoda,
  Leaf,
  Newspaper,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { AppText } from '@/components/ui/text';
import { formatConfidence } from '@/lib/format';
import {
  categoryColor,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  WASTE_CATEGORY_LABEL,
  type Tone,
} from '@/lib/reports';
import { useTheme } from '@/theme';
import type {
  ClassificationStatus,
  ReportStatus,
  WasteCategory,
} from '@/types/domain';

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge
      label={REPORT_STATUS_LABEL[status]}
      tone={REPORT_STATUS_TONE[status]}
      dot
    />
  );
}

export const CATEGORY_ICON: Record<WasteCategory, LucideIcon> = {
  ORGANIC_WASTE: Leaf,
  PLASTIC_WASTE: CupSoda,
  PAPER_WASTE: Newspaper,
};

export function categoryLabel(category: WasteCategory | null): string {
  return category ? WASTE_CATEGORY_LABEL[category] : 'Not classified';
}

/** Category as icon + colored text. Never a pill, so it cannot read as a status. */
export const UNCLASSIFIED_ICON = CircleHelp;

export function CategoryLabel({
  category,
}: {
  category: WasteCategory | null;
}) {
  const { colors, spacing } = useTheme();
  const color = categoryColor(colors, category);
  const Icon = category ? CATEGORY_ICON[category] : CircleHelp;
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
    >
      <Icon size={14} color={color} />
      <AppText variant="caption" weight="semibold" color={color}>
        {categoryLabel(category)}
      </AppText>
    </View>
  );
}

export function CategoryBadge({
  category,
}: {
  category: WasteCategory | null;
}) {
  return <CategoryLabel category={category} />;
}

export function ClassificationStatusBadge({
  status,
}: {
  status: ClassificationStatus;
}) {
  const tone: Tone = status === 'COMPLETED' ? 'success' : 'danger';
  return (
    <Badge
      label={status === 'COMPLETED' ? 'Classified' : 'Classification failed'}
      tone={tone}
    />
  );
}

export function ConfidenceText({ value }: { value: number | null }) {
  const { colors } = useTheme();
  if (value === null)
    return <AppText color={colors.mutedForeground}>—</AppText>;
  return <AppText weight="semibold">{formatConfidence(value)}</AppText>;
}
