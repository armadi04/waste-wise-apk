import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import type { UploadFile } from '@/api/media.api';
import { prepareReportImage } from '@/lib/image';

export type PhotoPermission = 'camera' | 'library' | null;

/**
 * Photo selection for report forms: pick or capture, compress, and remember
 * the uploaded `mediaId` so a retry never uploads twice.
 */
export function useReportPhoto() {
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [prepared, setPrepared] = useState<UploadFile | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [permissionPrompt, setPermissionPrompt] =
    useState<PhotoPermission>(null);

  const handleAsset = async (next: ImagePicker.ImagePickerAsset) => {
    setAsset(next);
    setPrepared(null);
    setMediaId(null);
    setError(null);
    setPreparing(true);
    try {
      setPrepared(await prepareReportImage(next));
    } catch (failure) {
      setAsset(null);
      setPrepared(null);
      setError(
        failure instanceof Error
          ? failure.message
          : 'This photo could not be used.',
      );
    } finally {
      setPreparing(false);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionPrompt('library');
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
      setPermissionPrompt('camera');
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

  const clear = () => {
    setAsset(null);
    setPrepared(null);
    setMediaId(null);
    setError(null);
  };

  return {
    asset,
    prepared,
    preparing,
    error,
    setError,
    mediaId,
    setMediaId,
    permissionPrompt,
    dismissPermissionPrompt: () => setPermissionPrompt(null),
    takePhoto,
    pickFromGallery,
    clear,
  };
}
