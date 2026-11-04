import { useRouter } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { Linking, RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { MarkdownLite } from '@/components/ui/markdown-lite';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useChangelog } from '@/hooks/use-changelog';
import { formatDayTitle } from '@/lib/format';
import { useTheme } from '@/theme';

export default function ChangelogScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const changelog = useChangelog();
  const releases = changelog.data ?? [];

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={changelog.isRefetching}
          onRefresh={() => void changelog.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader
        title="What's new"
        subtitle="Release notes for WasteWise."
        onBack={() => router.back()}
      />
      {changelog.isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={160} />
          <Skeleton height={160} />
        </View>
      ) : changelog.isError ? (
        <ErrorState
          message={errorMessage(changelog.error)}
          onRetry={() => void changelog.refetch()}
        />
      ) : releases.length === 0 ? (
        <EmptyState
          variant="plain"
          showAnimation={false}
          title="No release notes yet"
          description="Updates will be listed here after the next release."
        />
      ) : (
        releases.map((release, index) => (
          <Card key={release.version} style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                flexWrap: 'wrap',
              }}
            >
              <AppText variant="cardTitle" accessibilityRole="header">
                v{release.version}
              </AppText>
              {index === 0 ? <Badge label="Latest" tone="info" dot /> : null}
              {release.publishedAt ? (
                <AppText variant="caption" color={colors.mutedForeground}>
                  {formatDayTitle(release.publishedAt)}
                </AppText>
              ) : null}
            </View>
            {release.notes.trim() ? (
              <MarkdownLite source={release.notes} />
            ) : (
              <AppText color={colors.mutedForeground}>
                No notes for this release.
              </AppText>
            )}
            <Button
              label="View on GitHub"
              variant="ghost"
              icon={<ExternalLink size={16} color={colors.foreground} />}
              onPress={() => void Linking.openURL(release.url)}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}
