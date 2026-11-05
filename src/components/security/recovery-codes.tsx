import { KeyRound } from 'lucide-react-native';
import { View } from 'react-native';

import { InlineAlert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

/** Shows freshly issued recovery codes once; they cannot be viewed again. */
export function RecoveryCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Card style={{ gap: spacing.lg }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <KeyRound size={20} color={colors.foreground} />
        <AppText variant="cardTitle" accessibilityRole="header">
          Save your recovery codes
        </AppText>
      </View>
      <InlineAlert
        tone="warning"
        message="Each code works once if you lose your authenticator. They will not be shown again. Long-press to copy."
      />
      <View
        accessibilityLabel={`Recovery codes: ${codes.join(', ')}`}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.muted,
        }}
      >
        {codes.map((code) => (
          <AppText
            key={code}
            selectable
            style={{
              width: '47%',
              fontFamily: 'monospace',
              fontVariant: ['tabular-nums'],
            }}
          >
            {code}
          </AppText>
        ))}
      </View>
      <AppText selectable variant="caption" color={colors.mutedForeground}>
        {codes.join('  ')}
      </AppText>
      <Button label="I've saved these codes" fullWidth onPress={onDone} />
    </Card>
  );
}
