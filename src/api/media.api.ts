import api from './client';
import type { Media } from '@/types/domain';

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export async function uploadMedia(
  file: UploadFile,
  onProgress?: (percent: number) => void,
): Promise<Media> {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  const { data } = await api.post<Media>('/media/upload', form, {
    timeout: 60_000,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });
  return data;
}
