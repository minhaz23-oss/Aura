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

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      isLoaded &&
      !isSubmitting &&
      emailAddress.trim().length > 0 &&
      password.length > 0,
    [emailAddress, isLoaded, isSubmitting, password],
  );

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)" as Href);
        return;
      }

      setErrorMessage(
        "Your account needs an additional verification step. Please complete verification and try again.",
      );
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Unable to sign in. Check your credentials and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, emailAddress, isLoaded, password, router, setActive, signIn]);

  const handleCreateAccount = useCallback(() => {
    router.push("/(auth)/sign-up" as Href);
  }, [router]);

  const handleGoogleSignIn = useCallback(async () => {
    if (isSubmitting || isGoogleLoading) {
      return;
    }

    setErrorMessage(null);
    const result = await signInWithGoogle();
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  }, [isGoogleLoading, isSubmitting, signInWithGoogle]);

  const handleForgotPassword = useCallback(() => {
    router.push("/(auth)/forgot-password" as Href);
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
            <Text style={styles.phaseLabel}>PHASE_04: VERIFICATION</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.hero}>
            <PhaseIcon icon="verify" size={40} />
            <GlowingText style={styles.headline}>SYNC IDENTITY</GlowingText>

            <View style={styles.statusRow}>
              <View style={styles.statusLine} />
              <Text style={styles.statusText}>AUTHENTICATION GATE</Text>
              <View style={styles.statusLine} />
            </View>

            <Text style={styles.subtitle}>
              Link your credentials to initialize your hunter profile.
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
              editable={!isSubmitting}
            />
            <AuthTextField
              label="PASSWORD"
              placeholder="••••••••••••"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />

            <Pressable style={styles.forgotWrap} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <AuthPrimaryButton
              label={isSubmitting ? "SIGNING IN..." : "Sign In →"}
              onPress={handleSignIn}
              disabled={!canSubmit}
            />

            <AuthDivider />

            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerMuted}>New hunter?</Text>
              <Pressable onPress={handleCreateAccount} disabled={isSubmitting}>
                <Text style={styles.registerLink}>Create account</Text>
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
    width: "100%",
    height: "100%",
    backgroundColor: onboardingTheme.accent,
    borderRadius: 1,
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
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    ...body,
    color: onboardingTheme.accent,
    fontSize: 13,
    opacity: 0.85,
  },
  errorText: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -2,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  registerMuted: {
    ...body,
    color: onboardingTheme.accentMuted,
    fontSize: 13,
  },
  registerLink: {
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