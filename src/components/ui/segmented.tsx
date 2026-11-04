import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

interface Option<T extends string> {
  label: string;
  value: T;
  count?: number;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  scrollable,
  inset = 0,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
  inset?: number;
}) {
  const { colors, radius, spacing } = useTheme();

  const content = (
    <Pressable
      style={{ flexDirection: 'row', gap: spacing.sm }}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              option.count ? `${option.label}, ${option.count}` : option.label
            }
            onPress={() => onChange(option.value)}
            hitSlop={{ top: 6, bottom: 6 }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs + 2,
              paddingHorizontal: spacing.md,
              minHeight: 36,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: active ? colors.selectedBorder : colors.borderSubtle,
              backgroundColor: active
                ? colors.selectedBackground
                : pressed
                  ? colors.surfaceHover
                  : colors.surface,
            })}
          >
            <AppText
              variant="label"
              color={active ? colors.selectedForeground : colors.foreground}
              weight={active ? 'semibold' : 'medium'}
            >
              {option.label}
            </AppText>
            {option.count ? (
              <View
                style={{
                  minWidth: 20,
                  paddingHorizontal: 6,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  backgroundColor: active ? colors.surface : colors.muted,
                }}
              >
                <AppText
                  variant="caption"
                  weight="semibold"
                  color={
                    active ? colors.selectedForeground : colors.mutedForeground
                  }
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {option.count}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </Pressable>
  );

  if (!scrollable) return content;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: inset, paddingVertical: 6 }}
    >
      {content}
    </ScrollView>
  );
}
