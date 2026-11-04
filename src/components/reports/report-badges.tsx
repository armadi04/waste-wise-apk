import { Badge } from '@/components/ui/badge';
import { AppText } from '@/components/ui/text';
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  WASTE_CATEGORY_LABEL,
  WASTE_CATEGORY_TONE,
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
    />
  );
}

export function CategoryBadge({
  category,
}: {
  category: WasteCategory | null;
}) {
  if (!category) return <Badge label="Not classified" />;
  return (
    <Badge
      label={WASTE_CATEGORY_LABEL[category]}
      tone={WASTE_CATEGORY_TONE[category]}
    />
  );
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
  return <AppText weight="semibold">{(value * 100).toFixed(1)}%</AppText>;
}
