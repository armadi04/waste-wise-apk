import { Image } from 'expo-image';
import { Camera, ImagePlus, RefreshCw, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { mediaImageSource } from '@/lib/media-source';
import { useTheme } from '@/theme';

export function PhotoPicker({
  uri,
  preparing,
  error,
  disabled,
  onCamera,
  onGallery,
  onClear,
  clearable = true,
}: {
  uri: string | null;
  preparing: boolean;
  error: string | null;
  disabled: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onClear: () => void;
  /** Hide the remove button, e.g. while showing an existing report photo. */
  clearable?: boolean;
}) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {uri ? (
        <View
          style={{
            borderRadius: radius.lg,
            overflow: 'hidden',
            backgroundColor: colors.muted,
            aspectRatio: 4 / 3,
          }}
        >
          <Image
            source={mediaImageSource(uri)}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel="Selected report photo"
          />
          {clearable ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove selected photo"
              onPress={onClear}
              disabled={disabled}
              hitSlop={4}
              style={({ pressed }) => ({
                position: 'absolute',
                right: spacing.md,
                top: spacing.md,
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: pressed ? colors.surfaceHover : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <X size={20} color={colors.foreground} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retake photo"
            onPress={onCamera}
            disabled={disabled}
            style={({ pressed }) => ({
              position: 'absolute',
              right: spacing.md,
              bottom: spacing.md,
              minHeight: 44,
              paddingHorizontal: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              borderRadius: radius.pill,
              backgroundColor: pressed ? colors.surfaceHover : colors.surface,
            })}
          >
            <RefreshCw size={16} color={colors.foreground} />
            <AppText variant="label">Retake</AppText>
          </Pressable>
          {preparing ? (
            <View
              style={{
                position: 'absolute',
                left: spacing.md,
                bottom: spacing.md,
                minHeight: 44,
                paddingHorizontal: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="label">Preparing photo…</AppText>
            </View>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            borderRadius: radius.lg,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: error ? colors.dangerBorder : colors.borderControl,
            backgroundColor: colors.muted,
            padding: spacing.xl,
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          {preparing ? (
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator color={colors.primary} />
              <AppText color={colors.mutedForeground}>Preparing photo…</AppText>
            </View>
          ) : (
            <>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radius.pill,
                  backgroundColor: colors.selectedBackground,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImagePlus size={26} color={colors.selectedForeground} />
              </View>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <AppText variant="cardTitle">Add a photo of the waste</AppText>
                <AppText
                  variant="caption"
                  color={colors.mutedForeground}
                  style={{ textAlign: 'center' }}
                >
                  JPEG, PNG or WebP. Compressed to under 5 MB.
                </AppText>
              </View>
              <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
                <Button
                  label="Take photo"
                  fullWidth
                  icon={<Camera size={18} color={colors.primaryForeground} />}
                  onPress={onCamera}
                  disabled={disabled}
                />
                <Button
                  label="Choose from gallery"
                  variant="outline"
                  fullWidth
                  icon={<ImagePlus size={18} color={colors.foreground} />}
                  onPress={onGallery}
                  disabled={disabled}
                />
              </View>
            </>
          )}
        </View>
      )}
      {uri && !preparing ? (
        <Button
          label="Choose a different photo"
          variant="ghost"
          onPress={onGallery}
          disabled={disabled}
        />
      ) : null}
      {error ? (
        <AppText
          variant="caption"
          color={colors.danger}
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
