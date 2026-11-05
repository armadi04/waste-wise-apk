import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  View,
} from 'react-native';

import { errorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/format';
import { notificationRoute } from '@/lib/notifications';
import { groupByDay, toneColors, type Tone } from '@/lib/reports';
import { useTheme } from '@/theme';
import type { AppNotification, NotificationType } from '@/types/domain';

const TYPE_STYLE: Record<NotificationType, { icon: LucideIcon; tone: Tone }> = {
  info: { icon: Info, tone: 'info' },
  success: { icon: CheckCircle2, tone: 'success' },
  warning: { icon: AlertTriangle, tone: 'warning' },
  error: { icon: XCircle, tone: 'danger' },
};

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const { icon: Icon, tone } = TYPE_STYLE[item.type] ?? TYPE_STYLE.info;
  const toneStyle = toneColors(colors, tone);
  const when = formatRelativeTime(item.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? '' : 'Unread. '}${item.title}. ${item.message}. ${when}.`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: item.isRead ? colors.borderSubtle : colors.selectedBorder,
        backgroundColor: pressed
          ? colors.surfaceHover
          : item.isRead
            ? colors.surface
            : colors.selectedBackground,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: toneStyle.bg,
        }}
      >
        <Icon size={20} color={toneStyle.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <AppText
            weight={item.isRead ? 'medium' : 'semibold'}
            style={{ flex: 1 }}
            numberOfLines={2}
          >
            {item.title}
          </AppText>
          {item.isRead ? null : (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
              }}
            />
          )}
        </View>
        <AppText color={colors.mutedForeground}>{item.message}</AppText>
        <AppText variant="caption" color={colors.mutedForeground}>
          {when}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = useMemo(
    () => notifications.data?.pages.flatMap((page) => page.data) ?? [],
    [notifications.data],
  );
  const sections = useMemo(() => groupByDay(items), [items]);
  const hasUnread = items.some((item) => !item.isRead);

  const open = (item: AppNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    const route = notificationRoute(item.link);
    if (route) router.push(route as never);
  };

  return (
    <Screen contentContainerStyle={{ padding: 0, gap: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <ScreenHeader
          title="Notifications"
          onBack={() => router.back()}
          right={
            hasUnread ? (
              <Button
                label="Mark all read"
                variant="ghost"
                loading={markAll.isPending}
                onPress={() => markAll.mutate()}
              />
            ) : undefined
          }
        />
      </View>
      {notifications.isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={88} />
          <Skeleton height={88} />
        </View>
      ) : notifications.isError ? (
        <View style={{ padding: spacing.lg }}>
          <ErrorState
            message={errorMessage(notifications.error)}
            onRetry={() => void notifications.refetch()}
          />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          variant="plain"
          fill
          showAnimation={false}
          title="You're all caught up"
          description="Announcements and updates from WasteWise will appear here."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.huge,
          }}
          renderSectionHeader={({ section }) => (
            <AppText
              variant="caption"
              weight="semibold"
              color={colors.mutedForeground}
              accessibilityRole="header"
              style={{
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              {section.title}
            </AppText>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => open(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={
                notifications.isRefetching && !notifications.isFetchingNextPage
              }
              onRefresh={() => void notifications.refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={() => {
            if (
              notifications.hasNextPage &&
              !notifications.isFetchingNextPage
            ) {
              void notifications.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            notifications.isFetchingNextPage ? (
              <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}
