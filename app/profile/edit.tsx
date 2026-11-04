import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { usePreventRemove, useRouter } from 'expo-router';
import { Camera, Check, Globe, ImagePlus, Undo2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/auth-provider';
import { PhotoPermissionDialog } from '@/components/reports/photo-permission-dialog';
import { InlineAlert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextField } from '@/components/ui/field';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { AppText } from '@/components/ui/text';
import {
  useSaveProfile,
  useTimeZoneConfig,
  useTimeZonePreference,
} from '@/hooks/use-profile';
import { useReportPhoto } from '@/hooks/use-report-photo';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/lib/validation/profile';
import { useTheme } from '@/theme';

/** `undefined` = untouched, `null` = automatic (follow the device). */
type TimeZoneChoice = string | null | undefined;

function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

const AVATAR = 104;

export default function EditProfileScreen() {
  const { colors, radius, spacing } = useTheme();
  const router = useRouter();
  const { user, reloadProfile } = useAuth();
  const save = useSaveProfile(user?.id);
  const tzConfig = useTimeZoneConfig();
  const tzPreference = useTimeZonePreference();
  const avatar = useReportPhoto({ crop: [1, 1] });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: user?.fullname ?? '',
      phone: user?.phone ?? '',
    },
    mode: 'onBlur',
  });

  const [timeZone, setTimeZone] = useState<TimeZoneChoice>(undefined);
  const [tzOpen, setTzOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);

  const currentTimeZone = tzPreference.data?.timeZone ?? null;
  const tzChanged = timeZone !== undefined && timeZone !== currentTimeZone;
  const dirty = isDirty || Boolean(avatar.asset) || tzChanged;
  const disablePrevention = usePreventRemove(dirty && !leaving, ({ repeat }) =>
    setConfirmLeave(() => repeat),
  );

  const device = deviceTimeZone();
  const shownTimeZone = timeZone === undefined ? currentTimeZone : timeZone;
  const tzLabel = shownTimeZone ?? `Automatic${device ? ` (${device})` : ''}`;
  const tzOptions: { value: string | null; label: string }[] = [
    { value: null, label: `Automatic${device ? ` (${device})` : ''}` },
    ...(tzConfig.data?.businessTimeZones ?? []).map((zone) => ({
      value: zone,
      label: zone.replace(/_/g, ' '),
    })),
  ];

  const leave = () => {
    setLeaving(true);
    disablePrevention();
    router.back();
  };

  const submit = handleSubmit(async (values) => {
    setSaveError(null);
    if (avatar.asset && !avatar.prepared) {
      setSaveError('The new photo is still being prepared.');
      return;
    }
    try {
      await save.mutateAsync({
        profile: {
          fullname: values.fullname,
          phone: values.phone,
          avatar: avatar.prepared,
        },
        timeZone: tzChanged
          ? { timeZone: timeZone ?? null, lastDetectedTimeZone: device }
          : undefined,
      });
      await reloadProfile();
      leave();
    } catch (error) {
      setSaveError(errorMessage(error));
    }
  });

  return (
    <Screen
      scroll
      footer={
        <Button
          label="Save changes"
          fullWidth
          loading={save.isPending}
          loadingLabel="Saving…"
          disabled={!dirty || avatar.preparing}
          onPress={() => void submit()}
        />
      }
    >
      <ScreenHeader
        title="Edit profile"
        subtitle={user?.email ?? undefined}
        onBack={() => router.back()}
      />

      {saveError ? (
        <InlineAlert
          title="Profile not saved"
          message={saveError}
          testID="profile-error"
        />
      ) : null}

      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: AVATAR,
            height: AVATAR,
            borderRadius: AVATAR / 2,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatar.asset ? (
            <Image
              source={{ uri: avatar.asset.uri }}
              style={{ width: AVATAR, height: AVATAR }}
              contentFit="cover"
              accessibilityLabel="New profile photo"
            />
          ) : (
            <Avatar media={user?.avatar} name={user?.fullname} size={AVATAR} />
          )}
          {avatar.preparing ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.scrim,
              }}
            >
              <ActivityIndicator color={colors.primaryForeground} />
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Take photo"
            variant="outline"
            icon={<Camera size={16} color={colors.foreground} />}
            disabled={avatar.preparing || save.isPending}
            onPress={() => void avatar.takePhoto()}
          />
          <Button
            label="Gallery"
            variant="outline"
            icon={<ImagePlus size={16} color={colors.foreground} />}
            disabled={avatar.preparing || save.isPending}
            onPress={() => void avatar.pickFromGallery()}
          />
          {avatar.asset ? (
            <Button
              label="Undo"
              variant="ghost"
              icon={<Undo2 size={16} color={colors.foreground} />}
              onPress={avatar.clear}
            />
          ) : null}
        </View>
        {avatar.error ? (
          <AppText variant="caption" color={colors.danger}>
            {avatar.error}
          </AppText>
        ) : null}
      </View>

      <Controller
        control={control}
        name="fullname"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Full name"
            required
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="name"
            textContentType="name"
            error={errors.fullname?.message}
            editable={!save.isPending}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Phone"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="+62 812 3456 7890"
            hint="Optional. Used by the WasteWise team to follow up on reports."
            error={errors.phone?.message}
            editable={!save.isPending}
          />
        )}
      />

      <ListGroup title="Region">
        <ListRow
          icon={Globe}
          title="Time zone"
          subtitle="Used for dates on web and in reports"
          value={tzPreference.isLoading ? '…' : tzLabel}
          onPress={() => setTzOpen(true)}
        />
      </ListGroup>

      <BottomSheet
        visible={tzOpen}
        title="Time zone"
        onClose={() => setTzOpen(false)}
      >
        <ScrollView style={{ maxHeight: 360 }}>
          <View accessibilityRole="radiogroup" style={{ gap: spacing.xs }}>
            {tzOptions.map((option) => {
              const selected = option.value === shownTimeZone;
              return (
                <Pressable
                  key={option.value ?? 'auto'}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={option.label}
                  onPress={() => {
                    setTimeZone(option.value);
                    setTzOpen(false);
                  }}
                  style={({ pressed }) => ({
                    minHeight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: selected
                      ? colors.selectedBackground
                      : pressed
                        ? colors.surfaceHover
                        : 'transparent',
                  })}
                >
                  <AppText
                    style={{ flex: 1 }}
                    weight={selected ? 'semibold' : 'regular'}
                    color={
                      selected ? colors.selectedForeground : colors.foreground
                    }
                  >
                    {option.label}
                  </AppText>
                  {selected ? (
                    <Check size={18} color={colors.selectedForeground} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheet>

      <Dialog
        visible={confirmLeave !== null}
        tone="warning"
        title="Discard changes?"
        message="Your profile edits have not been saved."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          const repeat = confirmLeave;
          setConfirmLeave(null);
          setLeaving(true);
          repeat?.();
        }}
        onCancel={() => setConfirmLeave(null)}
      />
      <PhotoPermissionDialog
        prompt={avatar.permissionPrompt}
        onClose={avatar.dismissPermissionPrompt}
      />
    </Screen>
  );
}
