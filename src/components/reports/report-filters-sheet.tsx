import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import {
  DATE_PRESET_LABEL,
  DATE_PRESETS,
  WASTE_CATEGORIES,
  WASTE_CATEGORY_LABEL,
  type DatePreset,
} from '@/lib/reports';
import { useTheme } from '@/theme';
import type { WasteCategory } from '@/types/domain';

export interface ReportExtraFilters {
  category: WasteCategory | null;
  date: DatePreset;
}

export const EMPTY_EXTRA_FILTERS: ReportExtraFilters = {
  category: null,
  date: 'any',
};

export function countExtraFilters(value: ReportExtraFilters): number {
  return (value.category ? 1 : 0) + (value.date !== 'any' ? 1 : 0);
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" color={colors.mutedForeground}>
        {label}
      </AppText>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              hitSlop={{ top: 6, bottom: 6 }}
              style={({ pressed }) => ({
                minHeight: 36,
                justifyContent: 'center',
                paddingHorizontal: spacing.md,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: active
                  ? colors.selectedBorder
                  : colors.borderSubtle,
                backgroundColor: active
                  ? colors.selectedBackground
                  : pressed
                    ? colors.surfaceHover
                    : colors.surface,
              })}
            >
              <AppText
                variant="label"
                weight={active ? 'semibold' : 'medium'}
                color={active ? colors.selectedForeground : colors.foreground}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All categories' },
  ...WASTE_CATEGORIES.map((category) => ({
    value: category,
    label: WASTE_CATEGORY_LABEL[category],
  })),
] as { value: WasteCategory | 'ALL'; label: string }[];

const DATE_OPTIONS = DATE_PRESETS.map((preset) => ({
  value: preset,
  label: DATE_PRESET_LABEL[preset],
}));

/** Mount with a fresh `key` each time it opens so the draft resets. */
export function ReportFiltersSheet({
  visible,
  value,
  onApply,
  onClose,
}: {
  visible: boolean;
  value: ReportExtraFilters;
  onApply: (value: ReportExtraFilters) => void;
  onClose: () => void;
}) {
  const { spacing } = useTheme();
  const [draft, setDraft] = useState(value);

  return (
    <BottomSheet
      visible={visible}
      title="Filter reports"
      onClose={onClose}
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Reset"
            variant="outline"
            onPress={() => setDraft(EMPTY_EXTRA_FILTERS)}
            style={{ flex: 1 }}
          />
          <Button
            label="Apply filters"
            onPress={() => onApply(draft)}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <ChoiceGroup
        label="Waste category"
        options={CATEGORY_OPTIONS}
        value={draft.category ?? 'ALL'}
        onChange={(category) =>
          setDraft((current) => ({
            ...current,
            category: category === 'ALL' ? null : category,
          }))
        }
      />
      <ChoiceGroup
        label="Submitted"
        options={DATE_OPTIONS}
        value={draft.date}
        onChange={(date) => setDraft((current) => ({ ...current, date }))}
      />
    </BottomSheet>
  );
}
