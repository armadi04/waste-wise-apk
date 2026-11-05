import { File } from 'expo-file-system';
import {
  manipulateAsync,
  SaveFormat,
  type ImageResult,
} from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';

import type { UploadFile } from '@/api/media.api';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

function inferType(asset: ImagePickerAsset): string | null {
  if (asset.mimeType) return asset.mimeType;
  const name = asset.fileName?.toLowerCase() ?? asset.uri.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  return null;
}

function fileSize(uri: string, fallback?: number): number {
  try {
    const size = new File(uri).size;
    if (size > 0) return size;
  } catch {
    // Fall through to the picker metadata.
  }
  return fallback ?? 0;
}

async function compress(
  uri: string,
  width: number,
  quality: number,
): Promise<ImageResult> {
  return manipulateAsync(
    uri,
    width > 0 && width > 1600 ? [{ resize: { width: 1600 } }] : [],
    { compress: quality, format: SaveFormat.JPEG },
  );
}

export async function prepareReportImage(
  asset: ImagePickerAsset,
): Promise<UploadFile> {
  const type = inferType(asset);
  if (!type || !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
    throw new Error('Photo must be JPEG, PNG, or WebP');
  }

  const sourceSize = asset.fileSize ?? fileSize(asset.uri);
  if (sourceSize > MAX_SOURCE_BYTES) {
    throw new Error('Photo is too large. Choose an image under 20 MB.');
  }

  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    const result = await compress(asset.uri, asset.width, quality);
    const size = fileSize(result.uri, asset.fileSize);
    if (size > 0 && size <= MAX_IMAGE_BYTES) {
      return {
        uri: result.uri,
        name: `report-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };
    }
  }

  throw new Error(
    'Could not compress the photo below 5 MB. Choose another image.',
  );
}
