import { Image } from 'expo-image';
import { View } from 'react-native';

import { mediaViewUrl } from '@/lib/media-url';
import { useTheme } from '@/theme';
import type { Media } from '@/types/domain';

import { AppText } from './text';

export function Avatar({
  media,
  name,
  size = 56,
}: {
  media?: Media | null;
  name?: string | null;
  size?: number;
}) {
  const { colors } = useTheme();
  const uri = mediaViewUrl(media);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.selectedBackground,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <AppText variant="sectionTitle" color={colors.selectedForeground}>
          {initial}
        </AppText>
      )}
    </View>
  );
}
