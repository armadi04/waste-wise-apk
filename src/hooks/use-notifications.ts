import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications.api';
import { queryKeys } from '@/api/query-keys';

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: ({ pageParam }) => listNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.lastPage
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: 15_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unread,
    queryFn: getUnreadNotificationCount,
    staleTime: 30_000,
    // TanStack pauses intervals while the app is backgrounded.
    refetchInterval: 60_000,
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });
}
