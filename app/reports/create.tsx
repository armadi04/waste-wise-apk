import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Camera, ImagePlus, MapPin, RefreshCw, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Linking, Pressable, View } from 'react-native';

import { uploadMedia, type UploadFile } from '@/api/media.api';
import { errorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/field';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { useCreateReport } from '@/hooks/use-reports';
import { prepareReportImage } from '@/lib/image';
import { reportSchema, type ReportFormValues } from '@/lib/validation/report';
import { useTheme } from '@/theme';

type LocationState = 'idle' | 'loading' | 'ready' | 'error';
type SubmitStage = 'idle' | 'preparing' | 'uploading' | 'creating';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const LOCATION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Could not get your location in time. Try again.')),
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

export default function CreateReportScreen() {
  const { colors, radius, spacing } = useTheme();
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

  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [preparedPhoto, setPreparedPhoto] = useState<UploadFile | null>(null);
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const captureLocation = useCallback(async () => {
    setLocationState('loading');
    setLocationError(null);
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
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        LOCATION_TIMEOUT_MS,
      );

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationState('ready');
    } catch (error) {
      setLocation(null);
      setLocationState('error');
      setLocationError(
        error instanceof Error
          ? error.message
          : 'Could not get your location. Try again.',
      );
    }
  }, []);

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
        error instanceof Error ? error.message : 'This photo could not be used.',
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
      setSubmitError('A GPS location is required before submitting the report.');
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
        latitude: location.latitude,
        longitude: location.longitude,
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
    <Screen scroll>
      <ScreenHeader
        title="Create Report"
        subtitle="Add a photo, capture your location, and tell us what you found."
        onBack={() => router.back()}
      />

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="1. Photo" />
        <AppText color={colors.mutedForeground}>
          Take a photo or choose one from your gallery. JPEG, PNG, or WebP, up to
          5 MB after compression.
        </AppText>

        {photo ? (
          <View
            style={{
              borderRadius: radius.lg,
              overflow: 'hidden',
              backgroundColor: colors.muted,
            }}
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: '100%', height: 230 }}
              contentFit="cover"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove selected photo"
              onPress={clearPhoto}
              style={{
                position: 'absolute',
                right: spacing.md,
                top: spacing.md,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={colors.danger} />
            </Pressable>
            {preparingPhoto ? (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: spacing.sm,
                  backgroundColor: colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption">Preparing photo…</AppText>
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={{
              height: 180,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.borderControl,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: colors.muted,
            }}
          >
            {preparingPhoto ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <ImagePlus size={30} color={colors.mutedForeground} />
                <AppText color={colors.mutedForeground}>No photo selected</AppText>
              </>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Camera"
            variant="outline"
            icon={<Camera size={17} color={colors.foreground} />}
            onPress={() => void takePhoto()}
            disabled={preparingPhoto || busy}
            style={{ flex: 1 }}
          />
          <Button
            label="Gallery"
            variant="outline"
            icon={<ImagePlus size={17} color={colors.foreground} />}
            onPress={() => void pickFromGallery()}
            disabled={preparingPhoto || busy}
            style={{ flex: 1 }}
          />
        </View>
        {photoError ? (
          <AppText color={colors.danger}>{photoError}</AppText>
        ) : null}
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="2. Location" />
        {locationState === 'loading' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ActivityIndicator color={colors.primary} />
            <AppText color={colors.mutedForeground}>Getting your GPS location…</AppText>
          </View>
        ) : location ? (
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <MapPin size={18} color={colors.success} />
              <AppText weight="semibold">Location captured</AppText>
            </View>
            <AppText color={colors.mutedForeground} style={{ fontVariant: ['tabular-nums'] }}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </AppText>
          </View>
        ) : (
          <AppText color={colors.danger}>
            {locationError ?? 'Location is required to submit a report.'}
          </AppText>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label={location ? 'Refresh location' : 'Get location'}
            variant="outline"
            icon={<RefreshCw size={16} color={colors.foreground} />}
            onPress={() => void captureLocation()}
            loading={locationState === 'loading'}
            disabled={busy}
            style={{ flex: 1 }}
          />
          {locationState === 'error' ? (
            <Button
              label="Settings"
              variant="ghost"
              onPress={openSettings}
              disabled={busy}
            />
          ) : null}
        </View>
        <AppText variant="caption" color={colors.mutedForeground}>
          GPS is mandatory. Reports are never submitted with a placeholder
          location.
        </AppText>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="3. Description" />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="What did you find?"
              required
              multiline
              numberOfLines={5}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Describe the waste and where it was found"
              error={errors.description?.message}
              hint={`${value.trim().length}/2000 characters`}
              editable={!busy}
              maxLength={2000}
            />
          )}
        />
      </Card>

      {submitError ? (
        <Card
          style={{
            borderColor: colors.dangerBorder,
            backgroundColor: colors.dangerBackground,
          }}
        >
          <AppText color={colors.dangerForeground}>{submitError}</AppText>
        </Card>
      ) : null}

      {busy ? (
        <Card style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ActivityIndicator color={colors.primary} />
            <AppText weight="semibold">
              {submitStage === 'uploading'
                ? `Uploading photo${uploadPercent ? ` · ${uploadPercent}%` : ''}`
                : submitStage === 'creating'
                  ? 'Classifying with AI and saving report…'
                  : 'Preparing…'}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.mutedForeground}>
            Keep this screen open. Do not submit again until the process finishes.
          </AppText>
        </Card>
      ) : null}

      <Button
        label="Submit report"
        fullWidth
        loading={busy}
        disabled={!location || !preparedPhoto || preparingPhoto}
        onPress={() => void submit()}
      />

      <AppText variant="caption" color={colors.mutedForeground} style={{ textAlign: 'center' }}>
        AI classification runs automatically when you submit. Your report starts
        as Pending.
      </AppText>
    </Screen>
  );
}
