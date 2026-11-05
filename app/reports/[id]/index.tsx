import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarClock,
  ImageOff,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/auth-provider';
import {
  CategoryBadge,
  ClassificationStatusBadge,
  ConfidenceText,
  ReportStatusBadge,
} from '@/components/reports/report-badges';
import { InlineAlert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useDeleteReport, useReportDetail } from '@/hooks/use-reports';
import { formatCoordinate, formatDateTime } from '@/lib/format';
import { mediaViewUrl } from '@/lib/media-url';
import { mediaImageSource } from '@/lib/media-source';
import {
  canModifyReport,
  CLASSIFICATION_ERROR_LABEL,
  isLowConfidence,
} from '@/lib/reports';
import { useTheme } from '@/theme';

export default function ReportDetailScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const detail = useReportDetail(id);
  const { user } = useAuth();
  const removeReport = useDeleteReport();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const report = detail.data;
  const editable = report ? canModifyReport(report, user?.id) : false;

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await removeReport.mutateAsync(id);
      setConfirmingDelete(false);
      router.replace('/reports');
    } catch (error) {
      setConfirmingDelete(false);
      setDeleteError(errorMessage(error));
    }
  };
  const photoUri = mediaViewUrl(report?.media);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <Screen>
        <ScreenHeader title="Report" onBack={() => router.back()} />
        <ErrorState message="This report ID is not valid." />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={detail.isRefetching}
          onRefresh={() => void detail.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader
        title={`Report #${id}`}
        subtitle={
          report
            ? `Waste report · ${formatDateTime(report.createdAt)}`
            : undefined
        }
        onBack={() => router.back()}
      />

      {detail.isLoading ? (
        <LoadingState label="Loading report…" />
      ) : detail.isError ? (
        <ErrorState
          message={errorMessage(detail.error)}
          onRetry={() => void detail.refetch()}
        />
      ) : report ? (
        <>
          <View
            style={{
              borderRadius: radius.lg,
              overflow: 'hidden',
              backgroundColor: colors.muted,
              minHeight: 240,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {photoUri ? (
              <Image
                source={mediaImageSource(photoUri)}
                style={{ width: '100%', height: 320 }}
                contentFit="contain"
                transition={150}
              />
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: spacing.xl,
                }}
              >
                <ImageOff size={30} color={colors.mutedForeground} />
                <AppText color={colors.mutedForeground}>
                  Photo unavailable
                </AppText>
              </View>
            )}
          </View>

          <Card style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
              }}
            >
              <ReportStatusBadge status={report.status} />
              <CategoryBadge category={report.predictedCategory} />
            </View>
            <AppText variant="cardTitle">{report.description}</AppText>
            <AppText variant="caption" color={colors.mutedForeground}>
              {editable
                ? 'You can edit or delete this report while it is Pending.'
                : 'Report status is managed by WasteWise administrators.'}
            </AppText>
            {editable ? (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label="Edit"
                  variant="outline"
                  icon={<Pencil size={16} color={colors.foreground} />}
                  onPress={() =>
                    router.push({
                      pathname: '/reports/[id]/edit',
                      params: { id: String(id) },
                    })
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  label="Delete"
                  variant="danger-outline"
                  icon={<Trash2 size={16} color={colors.danger} />}
                  onPress={() => setConfirmingDelete(true)}
                  style={{ flex: 1 }}
                />
              </View>
            ) : null}
            {deleteError ? (
              <InlineAlert
                title="Report not deleted"
                message={deleteError}
                testID="delete-error"
              />
            ) : null}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <Sparkles size={18} color={colors.primary} />
              <AppText variant="cardTitle">AI classification</AppText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
              }}
            >
              <CategoryBadge category={report.predictedCategory} />
              <ClassificationStatusBadge status={report.classificationStatus} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.xxxl }}>
              <View style={{ gap: 2 }}>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Confidence
                </AppText>
                <ConfidenceText value={report.confidence} />
              </View>
              <View style={{ gap: 2 }}>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Model version
                </AppText>
                <AppText weight="semibold">
                  {report.modelVersion || '—'}
                </AppText>
              </View>
            </View>
            {report.classificationStatus === 'COMPLETED' &&
            isLowConfidence(report.confidence) ? (
              <View
                testID="low-confidence-note"
                style={{
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.warningBackground,
                  borderWidth: 1,
                  borderColor: colors.warningBorder,
                }}
              >
                <AppText color={colors.warningForeground}>
                  The AI is not sure about this category. Please check the photo
                  before relying on it.
                </AppText>
              </View>
            ) : null}
            {report.classificationStatus === 'FAILED' ? (
              <View
                style={{
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.warningBackground,
                  borderWidth: 1,
                  borderColor: colors.warningBorder,
                }}
              >
                <AppText color={colors.warningForeground}>
                  {CLASSIFICATION_ERROR_LABEL[
                    report.classificationError ?? ''
                  ] ||
                    'AI classification failed. No category or confidence was stored.'}
                </AppText>
              </View>
            ) : null}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <AppText variant="cardTitle">Details</AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <MapPin
                size={17}
                color={colors.mutedForeground}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Location
                </AppText>
                <AppText style={{ fontVariant: ['tabular-nums'] }}>
                  {report.latitude !== null && report.longitude !== null
                    ? `${formatCoordinate(report.latitude)}, ${formatCoordinate(report.longitude)}`
                    : 'Location not provided'}
                </AppText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <CalendarClock
                size={17}
                color={colors.mutedForeground}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Created
                </AppText>
                <AppText>{formatDateTime(report.createdAt)}</AppText>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Updated {formatDateTime(report.updatedAt)}
                </AppText>
              </View>
            </View>
          </Card>
        </>
      ) : null}
      <Dialog
        visible={confirmingDelete}
        tone="danger"
        icon={(color) => <Trash2 size={26} color={color} />}
        title="Delete this report?"
        message="The report and its AI result will be removed. This cannot be undone."
        confirmLabel="Delete report"
        loading={removeReport.isPending}
        loadingLabel="Deleting…"
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
