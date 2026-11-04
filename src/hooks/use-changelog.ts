import { useQuery } from '@tanstack/react-query';

import { listReleases } from '@/api/changelog.api';
import { queryKeys } from '@/api/query-keys';

export function useChangelog() {
  return useQuery({
    queryKey: queryKeys.changelog,
    queryFn: listReleases,
    staleTime: 10 * 60_000,
  });
}
