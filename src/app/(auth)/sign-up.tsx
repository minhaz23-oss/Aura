import { useSignUp } from "@clerk/clerk-expo";
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

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GlowingText } from "@/components/onboarding/GlowingText";
import { PhaseIcon } from "@/components/onboarding/PhaseIcon";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { getClerkErrorMessage } from "@/lib/clerk";

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canCreateAccount = useMemo(
    () =>
      isLoaded &&
      !isSubmitting &&
      !isVerifying &&
      emailAddress.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !hasPasswordMismatch,
    [
      confirmPassword.length,
      emailAddress,
      hasPasswordMismatch,
      isLoaded,
      isSubmitting,
      isVerifying,
      password.length,
    ],
  );

  const canVerifyCode = useMemo(
    () =>
      isLoaded &&
      !isSubmitting &&
      isVerifying &&
      verificationCode.trim().length > 0,
    [isLoaded, isSubmitting, isVerifying, verificationCode],
  );

  const handleCreateAccount = useCallback(async () => {
    if (!isLoaded || !canCreateAccount) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)" as Href);
        return;
      }

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerificationCode("");
      setIsVerifying(true);
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Unable to create account. Confirm your details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canCreateAccount, emailAddress, isLoaded, password, router, setActive, signUp]);

  const handleVerifyEmail = useCallback(async () => {
    if (!isLoaded || !canVerifyCode) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(tabs)" as Href);
        return;
      }

      setErrorMessage(
        "Verification is still pending. Confirm the latest code and try again.",
      );
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Unable to verify code. Request a new code and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canVerifyCode, isLoaded, router, setActive, signUp, verificationCode]);

  const handleGoogleSignUp = useCallback(async () => {
    if (isSubmitting || isGoogleLoading) {
      return;
    }

    setErrorMessage(null);
    const result = await signInWithGoogle();
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  }, [isGoogleLoading, isSubmitting, signInWithGoogle]);

  const handleGoToSignIn = useCallback(() => {
    router.replace("/(auth)/sign-in" as Href);
  }, [router]);

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
              {isVerifying ? "PHASE_06: CONFIRMATION" : "PHASE_05: INITIALIZATION"}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, isVerifying && styles.progressFull]} />
            </View>
          </View>

          <View style={styles.hero}>
            <PhaseIcon icon={isVerifying ? "verify" : "star"} size={40} />
            <GlowingText style={styles.headline}>
              {isVerifying ? "CONFIRM SIGNAL" : "AWAKEN HUNTER"}
            </GlowingText>

            <View style={styles.statusRow}>
              <View style={styles.statusLine} />
              <Text style={styles.statusText}>
                {isVerifying ? "EMAIL VERIFICATION" : "ACCOUNT LINK SEQUENCE"}
              </Text>
              <View style={styles.statusLine} />
            </View>

            <Text style={styles.subtitle}>
              {isVerifying
                ? "Enter the verification code sent to your email to complete activation."
                : "Create your hunter credentials to access your rank progression log."}
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
              editable={!isSubmitting && !isVerifying}
            />

            {!isVerifying ? (
              <>
                <AuthTextField
                  label="PASSWORD"
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
            ) : (
              <AuthTextField
                label="VERIFICATION_CODE"
                placeholder="123456"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!isSubmitting}
              />
            )}

            {hasPasswordMismatch && !isVerifying ? (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            ) : null}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <AuthPrimaryButton
              label={
                isSubmitting
                  ? isVerifying
                    ? "VERIFYING..."
                    : "CREATING ACCOUNT..."
                  : isVerifying
                    ? "Verify Email →"
                    : "Create Account →"
              }
              onPress={isVerifying ? handleVerifyEmail : handleCreateAccount}
              disabled={isVerifying ? !canVerifyCode : !canCreateAccount}
            />

            {!isVerifying ? (
              <>
                <AuthDivider />
                <GoogleSignInButton
                  onPress={handleGoogleSignUp}
                  disabled={isSubmitting || isGoogleLoading}
                />
              </>
            ) : null}

            <View style={styles.switchRow}>
              <Text style={styles.switchMuted}>Already linked?</Text>
              <Pressable onPress={handleGoToSignIn} disabled={isSubmitting}>
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
