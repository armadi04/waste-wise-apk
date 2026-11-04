import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Linking } from 'react-native';

import { uploadMedia } from '@/api/media.api';
import { errorMessage } from '@/api/errors';
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
import { useReportLocation } from '@/hooks/use-report-location';
import { useReportPhoto } from '@/hooks/use-report-photo';
import { useCreateReport } from '@/hooks/use-reports';
import { roundCoordinate } from '@/lib/format';
import { reportSchema, type ReportFormValues } from '@/lib/validation/report';

export default function CreateReportScreen() {
  const router = useRouter();
  const createReport = useCreateReport();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { description: '' },
    mode: 'onBlur',
  });
  const description = useWatch({ control, name: 'description' });

  const photo = useReportPhoto();
  // GPS is mandatory, so capture it as soon as the screen opens.
  const gps = useReportLocation({ autoCapture: true });
  const [uploadPercent, setUploadPercent] = useState(0);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!gps.location) {
      setSubmitError(
        'A GPS location is required before submitting the report.',
      );
      return;
    }
    if (!photo.asset || !photo.prepared) {
      photo.setError('A photo is required before submitting the report.');
      return;
    }

    try {
      let currentMediaId = photo.mediaId;
      if (!currentMediaId) {
        setSubmitStage('uploading');
        setUploadPercent(0);
        const media = await uploadMedia(photo.prepared, setUploadPercent);
        currentMediaId = media.id;
        photo.setMediaId(media.id);
      }

      setSubmitStage('creating');
      const report = await createReport.mutateAsync({
        description: values.description,
        mediaId: currentMediaId,
        latitude: roundCoordinate(gps.location.latitude),
        longitude: roundCoordinate(gps.location.longitude),
      });

      setSubmitStage('idle');
      router.replace({
        pathname: '/reports/[id]',
        params: { id: String(report.id) },
      });
    } catch (error) {
      setSubmitStage('idle');
      setSubmitError(errorMessage(error));
    }
  });

  const busy = submitStage !== 'idle' || createReport.isPending;

  return (
    <Screen
      scroll
      footer={
        <SubmitFooter
          requirements={{
            photo: Boolean(photo.prepared),
            location: Boolean(gps.location),
            description: description.trim().length >= 3,
          }}
          stage={submitStage}
          uploadPercent={uploadPercent}
          blocked={photo.preparing}
          onSubmit={() => void submit()}
        />
      }
    >
      <ScreenHeader
        title="New report"
        subtitle="Photo, location and a short description."
        onBack={() => router.back()}
      />

      {submitError ? (
        <InlineAlert
          title="Report not submitted"
          message={submitError}
          testID="submit-error"
        />
      ) : null}

      <PhotoPicker
        uri={photo.asset?.uri ?? null}
        preparing={photo.preparing}
        error={photo.error}
        disabled={photo.preparing || busy}
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
