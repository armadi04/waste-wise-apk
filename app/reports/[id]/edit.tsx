import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Linking } from 'react-native';

import { uploadMedia } from '@/api/media.api';
import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/auth-provider';
import { LocationStatus } from '@/components/reports/location-status';
import { PhotoPermissionDialog } from '@/components/reports/photo-permission-dialog';
import { PhotoPicker } from '@/components/reports/photo-picker';
import {
  SubmitFooter,
  type SubmitStage,
} from '@/components/reports/submit-footer';
import { InlineAlert } from '@/components/ui/alert';
import { TextField } from '@/components/ui/field';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { useReportLocation } from '@/hooks/use-report-location';
import { useReportPhoto } from '@/hooks/use-report-photo';
import { useReportDetail, useUpdateReport } from '@/hooks/use-reports';
import { roundCoordinate } from '@/lib/format';
import { mediaViewUrl } from '@/lib/media-url';
import { canModifyReport } from '@/lib/reports';
import { reportSchema, type ReportFormValues } from '@/lib/validation/report';
import type { Report, UpdateReportPayload } from '@/types/domain';

function EditReportForm({ report }: { report: Report }) {
  const router = useRouter();
  const updateReport = useUpdateReport(report.id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { description: report.description },
    mode: 'onBlur',
  });
  const description = useWatch({ control, name: 'description' });

  const photo = useReportPhoto();
  const existingPhoto = mediaViewUrl(report.media);
  const gps = useReportLocation({
    autoCapture: false,
    initial:
      report.latitude !== null && report.longitude !== null
        ? { latitude: report.latitude, longitude: report.longitude }
        : null,
  });
  const [uploadPercent, setUploadPercent] = useState(0);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const replacingPhoto = Boolean(photo.asset);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    if (!gps.location) {
      setSubmitError('A GPS location is required to save the report.');
      return;
    }
    if (replacingPhoto && !photo.prepared) {
      photo.setError('The new photo is not ready yet.');
      return;
    }

    try {
      const payload: UpdateReportPayload = {
        description: values.description,
        latitude: roundCoordinate(gps.location.latitude),
        longitude: roundCoordinate(gps.location.longitude),
      };
      if (photo.prepared) {
        let currentMediaId = photo.mediaId;
        if (!currentMediaId) {
          setSubmitStage('uploading');
          setUploadPercent(0);
          const media = await uploadMedia(photo.prepared, setUploadPercent);
          currentMediaId = media.id;
          photo.setMediaId(media.id);
        }
        payload.mediaId = currentMediaId;
      }

      setSubmitStage('creating');
      await updateReport.mutateAsync(payload);
      setSubmitStage('idle');
      router.back();
    } catch (error) {
      setSubmitStage('idle');
      setSubmitError(errorMessage(error));
    }
  });

  const busy = submitStage !== 'idle' || updateReport.isPending;

  return (
    <Screen
      scroll
      footer={
        <SubmitFooter
          requirements={{
            photo: replacingPhoto ? Boolean(photo.prepared) : true,
            location: Boolean(gps.location),
            description: description.trim().length >= 3,
          }}
          stage={submitStage}
          uploadPercent={uploadPercent}
          blocked={photo.preparing}
          onSubmit={() => void submit()}
          submitLabel="Save changes"
          savingLabel={replacingPhoto ? 'Classifying with AI…' : 'Saving…'}
          readyCaption={
            replacingPhoto
              ? 'The new photo will be classified again by AI.'
              : 'Changes apply while the report is still Pending.'
          }
        />
      }
    >
      <ScreenHeader
        title={`Edit report #${report.id}`}
        subtitle="Update the photo, location or description."
        onBack={() => router.back()}
      />

      {submitError ? (
        <InlineAlert
          title="Changes not saved"
          message={submitError}
          testID="submit-error"
        />
      ) : null}

      <PhotoPicker
        uri={photo.asset?.uri ?? existingPhoto}
        preparing={photo.preparing}
        error={photo.error}
        disabled={photo.preparing || busy}
        clearable={replacingPhoto}
        onCamera={() => void photo.takePhoto()}
        onGallery={() => void photo.pickFromGallery()}
        onClear={photo.clear}
      />

      <LocationStatus
        state={gps.state}
        location={gps.location}
        error={gps.error}
        disabled={busy || gps.state === 'loading'}
        onRefresh={() => void gps.capture()}
        onOpenSettings={() => void Linking.openSettings()}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Description"
            required
            multiline
            numberOfLines={5}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Describe the waste and where you found it"
            error={errors.description?.message}
            hint={`${value.trim().length}/2000`}
            editable={!busy}
            maxLength={2000}
          />
        )}
      />
      <PhotoPermissionDialog
        prompt={photo.permissionPrompt}
        onClose={photo.dismissPermissionPrompt}
      />
    </Screen>
  );
}

export default function EditReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const detail = useReportDetail(id);
  const { user } = useAuth();

  if (detail.data && canModifyReport(detail.data, user?.id)) {
    return <EditReportForm report={detail.data} />;
  }

  return (
    <Screen>
      <ScreenHeader title="Edit report" onBack={() => router.back()} />
      {detail.isLoading ? (
        <LoadingState label="Loading report…" />
      ) : detail.isError ? (
        <ErrorState
          message={errorMessage(detail.error)}
          onRetry={() => void detail.refetch()}
        />
      ) : (
        <ErrorState message="Only Pending reports you created can be edited." />
      )}
    </Screen>
  );
}
