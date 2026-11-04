import { Link } from 'expo-router';
import { View } from 'react-native';

import { AppLottie } from '@/components/ui/lottie';
import { Screen } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

export default function NotFoundScreen() {
  const { colors, spacing } = useTheme();
  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
        }}
      >
        <AppLottie source={require('../src/assets/lottie/404.json')} size={220} />
        <AppText variant="pageTitle">Page not found</AppText>
        <Link href="/">
          <AppText color={colors.link}>Go to dashboard</AppText>
        </Link>
      </View>
    </Screen>
  );
}
