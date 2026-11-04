import type { UploadFile } from '@/api/media.api';
import type { User } from '@/types/domain';

import api from './client';

export interface ProfileUpdate {
  fullname: string;
  phone: string;
  avatar?: UploadFile | null;
}

/** PATCH /users/:id (self) as multipart so an avatar can ride along. */
export async function updateProfile(
  userId: number,
  update: ProfileUpdate,
): Promise<User> {
  const form = new FormData();
  form.append('fullname', update.fullname);
  form.append('phone', update.phone);
  if (update.avatar) {
    form.append('avatar', {
      uri: update.avatar.uri,
      name: update.avatar.name,
      type: update.avatar.type,
    } as unknown as Blob);
  }
  const { data } = await api.patch<User>(`/users/${userId}`, form, {
    timeout: 60_000,
  });
  return data;
}
