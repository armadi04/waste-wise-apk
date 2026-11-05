import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  hint?: string;
  leftIcon?: ReactNode;
  required?: boolean;
  containerStyle?: object;
}

export function TextField({
  label,
  error,
  hint,
  leftIcon,
  required,
  containerStyle,
  onFocus,
  onBlur,
  multiline,
  ...inputProps
}: FieldProps) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const [focused, setFocused] = useState(false);
  const disabled = inputProps.editable === false;
  const showFocusRing = focused && !disabled;
  const ringRadius = radius.md + 2;

  const borderColor = disabled
    ? colors.disabledBorder
    : error
      ? colors.inputBorderError
      : focused
        ? colors.inputBorderFocus
        : colors.inputBorder;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <AppText variant="label" color={colors.foreground}>
        {label}
        {required ? <AppText color={colors.danger}> *</AppText> : null}
      </AppText>
      <View
        style={{
          borderRadius: ringRadius,
          padding: 2,
          backgroundColor: showFocusRing ? colors.focusOffset : 'transparent',
        }}
      >
        {showFocusRing ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderWidth: 2,
                borderColor: colors.focus,
                borderRadius: ringRadius,
              },
            ]}
          />
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            gap: spacing.sm,
            minHeight: multiline ? 112 : 48,
            borderWidth: 1,
            borderColor,
            borderRadius: radius.md,
            backgroundColor: disabled
              ? colors.disabledBackground
              : colors.inputBackground,
            paddingHorizontal: spacing.md,
            paddingVertical: multiline ? spacing.md : 0,
          }}
        >
          {leftIcon ? (
            <View style={{ paddingTop: multiline ? 2 : 0 }}>{leftIcon}</View>
          ) : null}
          <TextInput
            {...inputProps}
            multiline={multiline}
            accessibilityLabel={label}
            placeholderTextColor={colors.inputPlaceholder}
            selectionColor={colors.primary}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={{
              flex: 1,
              minHeight: multiline ? 96 : 46,
              color: disabled
                ? colors.disabledForeground
                : colors.inputForeground,
              fontFamily: fontFamily.regular,
              fontSize: 16,
              lineHeight: 24,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingVertical: multiline ? spacing.sm : 0,
            }}
          />
        </View>
      </View>
      {error ? (
        <AppText
          variant="caption"
          color={colors.danger}
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.mutedForeground}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
