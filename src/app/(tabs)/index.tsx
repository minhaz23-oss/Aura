import { useClerk, useUser } from "@clerk/clerk-expo";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { GlowingText } from "@/components/onboarding/GlowingText";
import { PhaseIcon } from "@/components/onboarding/PhaseIcon";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { getMainOnboardingProfile, type UserOnboardingProfile } from "@/lib/user-onboarding";

export default function HunterHomeScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.id) {
        return;
      }
      const stored = await getMainOnboardingProfile(user.id);
      if (isMounted) {
        setProfile(stored);
      }
    }
    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const identifier = useMemo(
    () =>
      user?.emailAddresses[0]?.emailAddress ??
      user?.username ??
      "hunter@system.mail",
    [user?.emailAddresses, user?.username],
  );

  const displayName = useMemo(
    () => user?.firstName ?? user?.fullName ?? "Hunter",
    [user?.firstName, user?.fullName],
  );

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/onboarding" as Href);
    } finally {
      setIsSigningOut(false);
    }
  }, [router, signOut]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <PhaseIcon icon="star" size={40} />
          <GlowingText style={styles.headline}>HUNTER LINKED</GlowingText>
          <Text style={styles.subtitle}>
            Welcome back, {displayName}. Your identity sync is complete.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ACTIVE_ACCOUNT</Text>
          <Text style={styles.value}>{identifier}</Text>
        </View>

        {profile ? (
          <View style={styles.card}>
            <Text style={styles.label}>ONBOARDING_PROFILE_OBJECT</Text>
            <Text style={styles.value}>
              {JSON.stringify(profile, null, 2)}
            </Text>
          </View>
        ) : null}

        <AuthPrimaryButton
          label={isSigningOut ? "SIGNING OUT..." : "Sign Out"}
          onPress={handleSignOut}
          disabled={isSigningOut}
        />
      </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: "space-between",
    gap: 24,
  },
  hero: {
    marginTop: 12,
    alignItems: "center",
    gap: 14,
  },
  headline: {
    fontSize: 24,
  },
  subtitle: {
    ...body,
    color: onboardingTheme.accentMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  card: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: onboardingTheme.radius,
    backgroundColor: onboardingTheme.surface,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 8,
  },
  label: {
    ...mono,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  value: {
    ...body,
    color: onboardingTheme.accent,
    fontSize: 15,
  },
});
