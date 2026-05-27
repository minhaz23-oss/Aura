import { useSignIn } from "@clerk/clerk-expo";
import { type Href, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { GlowingText } from "@/components/onboarding/GlowingText";
import { PhaseIcon } from "@/components/onboarding/PhaseIcon";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { getClerkErrorMessage } from "@/lib/clerk";

type ResetPhase = "request" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [phase, setPhase] = useState<ResetPhase>("request");
  const [emailAddress, setEmailAddress] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canRequestCode = useMemo(
    () =>
      isLoaded && !isSubmitting && phase === "request" && emailAddress.trim().length > 0,
    [emailAddress, isLoaded, isSubmitting, phase],
  );

  const canResetPassword = useMemo(
    () =>
      isLoaded &&
      !isSubmitting &&
      phase === "reset" &&
      verificationCode.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !hasPasswordMismatch,
    [
      confirmPassword.length,
      hasPasswordMismatch,
      isLoaded,
      isSubmitting,
      password.length,
      phase,
      verificationCode,
    ],
  );

  const handleRequestCode = useCallback(async () => {
    if (!isLoaded || !canRequestCode) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress.trim(),
      });
      setVerificationCode("");
      setPassword("");
      setConfirmPassword("");
      setPhase("reset");
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Unable to send reset code. Check the email address and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canRequestCode, emailAddress, isLoaded, signIn]);

  const handleResetPassword = useCallback(async () => {
    if (!isLoaded || !canResetPassword) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)" as Href);
        return;
      }

      setErrorMessage(
        "Password reset needs another step. Check your verification code and try again.",
      );
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Unable to reset password. Confirm the code and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canResetPassword, isLoaded, password, router, setActive, signIn, verificationCode]);

  const handleBackToSignIn = useCallback(() => {
    router.replace("/(auth)/sign-in" as Href);
  }, [router]);

  const isResetPhase = phase === "reset";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.phaseLabel}>
              {isResetPhase ? "PHASE_06: RECOVERY" : "PHASE_05: RECOVERY"}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, isResetPhase && styles.progressFull]} />
            </View>
          </View>

          <View style={styles.hero}>
            <PhaseIcon icon="verify" size={40} />
            <GlowingText style={styles.headline}>
              {isResetPhase ? "RESTORE ACCESS" : "SIGNAL LOST"}
            </GlowingText>

            <View style={styles.statusRow}>
              <View style={styles.statusLine} />
              <Text style={styles.statusText}>
                {isResetPhase ? "PASSWORD RECOVERY" : "IDENTITY RECOVERY"}
              </Text>
              <View style={styles.statusLine} />
            </View>

            <Text style={styles.subtitle}>
              {isResetPhase
                ? "Enter the recovery code from your email and set a new password."
                : "Enter your linked email to receive a secure password reset code."}
            </Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              label="EMAIL_ADDRESS"
              placeholder="hunter@system.mail"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={emailAddress}
              onChangeText={setEmailAddress}
              editable={!isSubmitting && !isResetPhase}
            />

            {isResetPhase ? (
              <>
                <AuthTextField
                  label="RECOVERY_CODE"
                  placeholder="123456"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  editable={!isSubmitting}
                />
                <AuthTextField
                  label="NEW_PASSWORD"
                  placeholder="••••••••••••"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
                <AuthTextField
                  label="CONFIRM_PASSWORD"
                  placeholder="••••••••••••"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isSubmitting}
                />
              </>
            ) : null}

            {hasPasswordMismatch && isResetPhase ? (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            ) : null}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <AuthPrimaryButton
              label={
                isSubmitting
                  ? isResetPhase
                    ? "RESETTING..."
                    : "SENDING CODE..."
                  : isResetPhase
                    ? "Reset Password →"
                    : "Send Recovery Code →"
              }
              onPress={isResetPhase ? handleResetPassword : handleRequestCode}
              disabled={isResetPhase ? !canResetPassword : !canRequestCode}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchMuted}>Access restored?</Text>
              <Pressable onPress={handleBackToSignIn} disabled={isSubmitting}>
                <Text style={styles.switchLink}>Return to sign in</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footerHint}>SECURE CHANNEL · CLERK AUTH ENABLED</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const body = {
  fontFamily: appFonts.regular,
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  header: {
    alignItems: "flex-end",
    gap: 8,
  },
  phaseLabel: {
    ...mono,
    color: onboardingTheme.accentMuted,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  progressTrack: {
    width: 120,
    height: 2,
    backgroundColor: onboardingTheme.progressTrack,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    width: "58%",
    height: "100%",
    backgroundColor: onboardingTheme.accent,
    borderRadius: 1,
  },
  progressFull: {
    width: "100%",
  },
  hero: {
    alignItems: "center",
    gap: 14,
  },
  headline: {
    fontSize: 24,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  statusLine: {
    flex: 1,
    height: 1,
    backgroundColor: onboardingTheme.line,
  },
  statusText: {
    ...mono,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  subtitle: {
    ...body,
    color: onboardingTheme.accentMuted,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  form: {
    gap: 16,
    marginTop: 4,
  },
  errorText: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  switchMuted: {
    ...body,
    color: onboardingTheme.accentMuted,
    fontSize: 13,
  },
  switchLink: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  footerHint: {
    ...mono,
    color: onboardingTheme.accentDim,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 8,
  },
});
