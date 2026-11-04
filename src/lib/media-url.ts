import { API_BASE_URL } from './config';
import type { Media } from '@/types/domain';

export function mediaViewUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  if (media.id) return `${API_BASE_URL}/media/${media.id}/view`;
  return media.url;
}
