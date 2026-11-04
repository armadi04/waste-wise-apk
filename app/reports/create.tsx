import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Linking } from 'react-native';

import { uploadMedia, type UploadFile } from '@/api/media.api';
import { errorMessage } from '@/api/errors';
import {
  LocationStatus,
  type Coordinates,
  type LocationState,
} from '@/components/reports/location-status';
import { PhotoPicker } from '@/components/reports/photo-picker';
import {
  SubmitFooter,
  type SubmitStage,
} from '@/components/reports/submit-footer';
import { InlineAlert } from '@/components/ui/alert';
import { TextField } from '@/components/ui/field';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { useCreateReport } from '@/hooks/use-reports';
import { roundCoordinate } from '@/lib/format';
import { prepareReportImage } from '@/lib/image';
import { reportSchema, type ReportFormValues } from '@/lib/validation/report';

const LOCATION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        reject(new Error('Could not get your location in time. Try again.')),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

type LocationResult =
  { ok: true; coords: Coordinates } | { ok: false; message: string };

async function readLocation(): Promise<LocationResult> {
  try {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      throw new Error(
        'Location services are turned off. Enable GPS in your device settings.',
      );
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        'Location permission is required to create a report. Allow it in settings and try again.',
      );
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      LOCATION_TIMEOUT_MS,
    );
    return {
      ok: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Could not get your location. Try again.',
    };
  }
}

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

  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [preparedPhoto, setPreparedPhoto] = useState<UploadFile | null>(null);
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('loading');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const applyLocation = useCallback((result: LocationResult) => {
    if (result.ok) {
      setLocation(result.coords);
      setLocationState('ready');
      setLocationError(null);
    } else {
      setLocation(null);
      setLocationState('error');
      setLocationError(result.message);
    }
  }, []);

  const captureLocation = useCallback(async () => {
    setLocationState('loading');
    setLocationError(null);
    applyLocation(await readLocation());
  }, [applyLocation]);

  // GPS is mandatory, so capture it as soon as the screen opens.
  useEffect(() => {
    let active = true;
    void readLocation().then((result) => {
      if (active) applyLocation(result);
    });
    return () => {
      active = false;
    };
  }, [applyLocation]);

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setPhoto(asset);
    setPreparedPhoto(null);
    setMediaId(null);
    setPhotoError(null);
    setPreparingPhoto(true);
    try {
      const prepared = await prepareReportImage(asset);
      setPreparedPhoto(prepared);
    } catch (error) {
      setPhoto(null);
      setPreparedPhoto(null);
      setPhotoError(
        error instanceof Error
          ? error.message
          : 'This photo could not be used.',
      );
    } finally {
      setPreparingPhoto(false);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo access to choose a report photo, or use the camera instead.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      await handleAsset(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera permission needed',
        'Allow camera access to take a report photo.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      await handleAsset(result.assets[0]);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreparedPhoto(null);
    setMediaId(null);
    setPhotoError(null);
  };

  const openSettings = () => {
    void Linking.openSettings();
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!location) {
      setSubmitError(
        'A GPS location is required before submitting the report.',
      );
      return;
    }
    if (!photo || !preparedPhoto) {
      setPhotoError('A photo is required before submitting the report.');
      return;
    }

    try {
      let currentMediaId = mediaId;
      if (!currentMediaId) {
        setSubmitStage('uploading');
        setUploadPercent(0);
        const media = await uploadMedia(preparedPhoto, setUploadPercent);
        currentMediaId = media.id;
        setMediaId(media.id);
      }

      setSubmitStage('creating');
      const report = await createReport.mutateAsync({
        description: values.description,
        mediaId: currentMediaId,
        latitude: roundCoordinate(location.latitude),
        longitude: roundCoordinate(location.longitude),
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
            photo: Boolean(preparedPhoto),
            location: Boolean(location),
            description: description.trim().length >= 3,
          }}
          stage={submitStage}
          uploadPercent={uploadPercent}
          blocked={preparingPhoto}
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
        uri={photo?.uri ?? null}
        preparing={preparingPhoto}
        error={photoError}
        disabled={preparingPhoto || busy}
        onCamera={() => void takePhoto()}
        onGallery={() => void pickFromGallery()}
        onClear={clearPhoto}
      />

      <LocationStatus
        state={locationState}
        location={location}
        error={locationError}
        disabled={busy || locationState === 'loading'}
        onRefresh={() => void captureLocation()}
        onOpenSettings={openSettings}
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
    </Screen>
  );
}
