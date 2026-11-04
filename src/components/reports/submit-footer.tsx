import { CheckCircle2, Circle } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

export type SubmitStage = 'idle' | 'uploading' | 'creating';

export interface SubmitRequirements {
  photo: boolean;
  location: boolean;
  description: boolean;
}

const REQUIREMENTS: {
  key: keyof SubmitRequirements;
  label: string;
  missing: string;
}[] = [
  { key: 'photo', label: 'Photo', missing: 'Add a photo to continue.' },
  {
    key: 'location',
    label: 'Location',
    missing: 'Waiting for your GPS location.',
  },
  {
    key: 'description',
    label: 'Description',
    missing: 'Describe what you found (at least 3 characters).',
  },
];

export function stageLabel(
  stage: SubmitStage,
  uploadPercent: number,
  savingLabel = 'Classifying with AI…',
): string {
  if (stage === 'uploading') {
    return uploadPercent
      ? `Uploading photo · ${uploadPercent}%`
      : 'Uploading photo…';
  }
  if (stage === 'creating') return savingLabel;
  return '';
}

export function SubmitFooter({
  requirements,
  stage,
  uploadPercent,
  blocked,
  onSubmit,
  submitLabel = 'Submit report',
  savingLabel,
  readyCaption = 'AI classifies the photo on submit. Your report starts as Pending.',
}: {
  requirements: SubmitRequirements;
  stage: SubmitStage;
  uploadPercent: number;
  /** Extra reason the button cannot be pressed, e.g. a photo is preparing. */
  blocked?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  /** Button label while the report request runs (after any upload). */
  savingLabel?: string;
  readyCaption?: string;
}) {
  const { colors, radius, spacing } = useTheme();
  const busy = stage !== 'idle';
  const firstMissing = REQUIREMENTS.find((item) => !requirements[item.key]);
  const caption = busy
    ? 'Keep this screen open until it finishes.'
    : firstMissing
      ? firstMissing.missing
      : readyCaption;

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {REQUIREMENTS.map((item) => {
          const done = requirements[item.key];
          const Icon = done ? CheckCircle2 : Circle;
          return (
            <View
              key={item.key}
              accessible
              accessibilityLabel={`${item.label}: ${done ? 'done' : 'missing'}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: done ? colors.successBackground : colors.muted,
              }}
            >
              <Icon
                size={14}
                color={done ? colors.successForeground : colors.mutedForeground}
              />
              <AppText
                variant="caption"
                weight="medium"
                color={done ? colors.successForeground : colors.mutedForeground}
              >
                {item.label}
              </AppText>
            </View>
          );
        })}
      </View>
      <Button
        label={submitLabel}
        fullWidth
        loading={busy}
        loadingLabel={stageLabel(stage, uploadPercent, savingLabel)}
        disabled={Boolean(firstMissing) || blocked}
        onPress={onSubmit}
      />
      <AppText
        variant="caption"
        color={colors.mutedForeground}
        style={{ textAlign: 'center' }}
        accessibilityLiveRegion="polite"
      >
        {caption}
      </AppText>
    </>
  );
}
