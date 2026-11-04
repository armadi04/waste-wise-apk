import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

/** Tappable settings/navigation row: icon, title, optional detail, chevron. */
export function ListRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onPress,
  tone = 'default',
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Short trailing detail such as "On" or a count. */
  value?: ReactNode;
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  const { colors, radius, spacing } = useTheme();
  const accent = tone === 'danger' ? colors.danger : colors.foreground;
  const label = [
    title,
    subtitle,
    typeof value === 'string' || typeof value === 'number' ? value : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: pressed ? colors.surfaceHover : 'transparent',
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            tone === 'danger' ? colors.dangerBackground : colors.muted,
        }}
      >
        <Icon size={18} color={accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText weight="medium" color={accent}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.mutedForeground}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {typeof value === 'string' || typeof value === 'number' ? (
        <AppText variant="label" color={colors.mutedForeground}>
          {value}
        </AppText>
      ) : (
        value
      )}
      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

/** Card grouping list rows under an optional caption title. */
export function ListGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const { colors, radius, spacing } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: spacing.sm }}>
      {title ? (
        <AppText
          variant="caption"
          weight="semibold"
          color={colors.mutedForeground}
          accessibilityRole="header"
          style={{
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            paddingHorizontal: spacing.xs,
          }}
        >
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index ? (
              <View
                style={{
                  height: 1,
                  marginLeft: spacing.lg + 36 + spacing.md,
                  backgroundColor: colors.borderSubtle,
                }}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
