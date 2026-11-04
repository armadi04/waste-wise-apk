import { ShieldCheck } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";

import { useAuth } from "@/auth/auth-provider";
import { GoogleIcon } from "@/components/ui/google-icon";
import { AppText } from "@/components/ui/text";
import { IS_GOOGLE_CONFIGURED } from "@/lib/config";
import { useTheme } from "@/theme";

type AuthMode = "login" | "register";

function AuthHeaderPattern() {
  const { colors } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid slice"
      >
        <G fill={colors.brandForeground} opacity={0.08}>
          <Circle cx={34} cy={44} r={1.4} />
          <Circle cx={92} cy={82} r={1} />
          <Circle cx={144} cy={32} r={1.2} />
          <Circle cx={214} cy={68} r={0.9} />
          <Circle cx={278} cy={38} r={1.4} />
          <Circle cx={334} cy={94} r={1.1} />
          <Circle cx={372} cy={54} r={0.9} />
          <Circle cx={54} cy={126} r={1} />
          <Circle cx={306} cy={142} r={1.2} />
          <Path d="M0 280V248h44v-24c0-13 10-23 23-23s23 10 23 23v24h52v-38c0-18 14-32 32-32s32 14 32 32v38h60v-30c0-15 12-27 27-27s27 12 27 27v30h60v-20c0-11 9-20 20-20s20 9 20 20v20Z" />
        </G>
        <G
          fill="none"
          stroke={colors.brandForeground}
          strokeWidth={1.2}
          opacity={0.13}
        >
          <Path d="M118 280V154c0-54 36-88 82-88s82 34 82 88v126" />
          <Path d="M154 280V172c0-35 22-58 46-58s46 23 46 58v108" />
        </G>
      </Svg>
    </View>
  );
}

function AuthModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  disabled: boolean;
}) {
  const { colors, radius } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.toggleTrack,
        {
          backgroundColor: disabled
            ? colors.disabledBackground
            : colors.muted,
          borderColor: disabled
            ? colors.disabledBorder
            : colors.borderSubtle,
        },
      ]}
    >
      {(["login", "register"] as const).map((value) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled }}
            disabled={disabled}
            onPress={() => onChange(value)}
            style={({ pressed }) => [
              styles.toggleItem,
              { borderRadius: radius.pill },
              active && [
                styles.toggleItemActive,
                {
                  backgroundColor: disabled
                    ? colors.disabledBackground
                    : colors.surface,
                  shadowColor: colors.shadow,
                },
              ],
              pressed && !active && !disabled && { opacity: 0.7 },
            ]}
          >
            <AppText
              color={
                disabled
                  ? colors.disabledForeground
                  : active
                    ? colors.foreground
                    : colors.mutedForeground
              }
              weight={active ? "semibold" : "medium"}
              style={{ fontSize: 14 }}
            >
              {value === "login" ? "Log In" : "Sign up"}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function GoogleButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const { colors, radius } = useTheme();
  const contentColor = disabled
    ? colors.disabledForeground
    : colors.primaryForeground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.googleButton,
        {
          borderRadius: radius.pill,
          backgroundColor: disabled
            ? colors.disabledBackground
            : pressed
              ? colors.primaryPressed
              : colors.primary,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <>
          <View
            style={[
              styles.googleMark,
              { backgroundColor: colors.primaryForeground },
            ]}
          >
            <GoogleIcon size={17} />
          </View>
          <AppText variant="button" color={contentColor} weight="semibold">
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export default function LoginScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, isSigningIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  const copy = isRegister
    ? {
        headerTitle: "Create Account",
        headerSubtitle:
          "Start your WasteWise journey with a secure Google sign-in.",
        sheetTitle: "Create your account",
        sheetBody:
          "Use your Google account to get started. New WasteWise accounts are created automatically after verification.",
        cta: "Sign up with Google",
        assurance:
          "A verified Google email keeps your reports secure and easy to recover.",
        switchPrompt: "Already have an account?",
        switchAction: "Log in",
      }
    : {
        headerTitle: "Welcome Back",
        headerSubtitle:
          "Sign in with Google to keep tracking your reports and impact.",
        sheetTitle: "Continue with Google",
        sheetBody:
          "Pick up where you left off. No password needed — your Google account keeps access simple and secure.",
        cta: "Continue with Google",
        assurance: "Your report data stays private to your Google account.",
        switchPrompt: "Don't have an account?",
        switchAction: "Create account",
      };

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Google Sign-In failed. Please try again.",
      );
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.brand }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <AuthHeaderPattern />
        <View style={styles.headerContent}>
          <AppText
            color={colors.accent}
            weight="semibold"
            style={{ fontSize: 16, letterSpacing: 0.4 }}
          >
            WasteWise
          </AppText>
          <AppText
            variant="display"
            color={colors.brandForeground}
            style={{ textAlign: "center", letterSpacing: -0.4 }}
          >
            {copy.headerTitle}
          </AppText>
          <AppText
            color={colors.brandMutedForeground}
            style={{
              maxWidth: 320,
              textAlign: "center",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {copy.headerSubtitle}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthModeToggle
            mode={mode}
            onChange={changeMode}
            disabled={isSigningIn}
          />

          <View style={styles.sheetMain}>
            <View style={{ gap: spacing.sm }}>
              <AppText variant="sectionTitle">{copy.sheetTitle}</AppText>
              <AppText color={colors.mutedForeground}>{copy.sheetBody}</AppText>
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.borderSubtle,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <View
                style={[styles.infoIcon, { backgroundColor: colors.surface }]}
              >
                <GoogleIcon size={20} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText
                  weight="semibold"
                  style={{ fontSize: 15, lineHeight: 21 }}
                >
                  Google account
                </AppText>
                <AppText variant="caption" color={colors.mutedForeground}>
                  No extra password. Your reports stay tied to your account.
                </AppText>
              </View>
            </View>

            {!IS_GOOGLE_CONFIGURED ? (
              <View
                style={{
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.warningBackground,
                  borderWidth: 1,
                  borderColor: colors.warningBorder,
                }}
              >
                <AppText color={colors.warningForeground}>
                  Google Sign-In is not configured. Set{" "}
                  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID before building the app.
                </AppText>
              </View>
            ) : null}

            <GoogleButton
              label={copy.cta}
              onPress={() => void handleSignIn()}
              loading={isSigningIn}
              disabled={!IS_GOOGLE_CONFIGURED}
            />

            {error ? (
              <View
                style={{
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.dangerBackground,
                  borderWidth: 1,
                  borderColor: colors.dangerBorder,
                }}
              >
                <AppText color={colors.dangerForeground}>{error}</AppText>
              </View>
            ) : null}

            <View style={styles.assuranceRow}>
              <ShieldCheck size={16} color={colors.mutedForeground} />
              <AppText
                variant="caption"
                color={colors.mutedForeground}
                style={{ flex: 1 }}
              >
                {copy.assurance}
              </AppText>
            </View>
          </View>

          <View style={styles.switchRow}>
            <AppText color={colors.mutedForeground}>
              {copy.switchPrompt}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => changeMode(isRegister ? "login" : "register")}
              hitSlop={8}
            >
              <AppText color={colors.link} weight="semibold">
                {copy.switchAction}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  headerContent: {
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
  },
  sheet: {
    flex: 1,
    marginTop: -32,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 20,
  },
  sheetMain: {
    gap: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  toggleTrack: {
    flexDirection: "row",
    padding: 4,
    borderWidth: 1,
    borderRadius: 999,
  },
  toggleItem: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleItemActive: {
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  assuranceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  switchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
