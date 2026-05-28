import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import {
  EMPTY_ONBOARDING_PROFILE,
  getMainOnboardingProfile,
  type UserOnboardingProfile,
} from "@/lib/user-onboarding";

type Attribute = {
  key: "STR" | "AGI" | "END" | "VIT";
  value: number;
};

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildAttributes(profile: UserOnboardingProfile): Attribute[] {
  const activityBoost =
    profile.activityLevel === "Advanced" ? 4 : profile.activityLevel === "Moderate" ? 2 : 0;
  const days = parseNumber(profile.workoutDaysPerWeek, 3);
  const duration = parseNumber(profile.workoutDurationMinutes, 30);
  const sleep = parseNumber(profile.sleepHours, 7);
  const age = parseNumber(profile.age, 24);

  const str = clamp(3, Math.round(6 + days * 1.15 + duration / 18 + activityBoost), 20);
  const agi = clamp(
    3,
    Math.round(5 + sleep * 0.9 + (profile.primaryGoal === "Endurance" ? 3 : 1)),
    20,
  );
  const end = clamp(
    3,
    Math.round(5 + days * 0.9 + sleep * 0.7 + (profile.primaryGoal === "Fat loss" ? 2 : 0)),
    20,
  );
  const vit = clamp(3, Math.round(8 + sleep * 0.9 - Math.max(0, age - 30) * 0.14), 20);

  return [
    { key: "STR", value: str },
    { key: "AGI", value: agi },
    { key: "END", value: end },
    { key: "VIT", value: vit },
  ];
}

function getRank(attributes: Attribute[]) {
  const avg = attributes.reduce((sum, item) => sum + item.value, 0) / attributes.length;
  if (avg >= 17) {
    return "S";
  }
  if (avg >= 14) {
    return "A";
  }
  if (avg >= 11) {
    return "B";
  }
  if (avg >= 8) {
    return "C";
  }
  return "E";
}

export default function AssessmentScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const hasNavigatedRef = useRef(false);
  const [profile, setProfile] = useState<UserOnboardingProfile>(EMPTY_ONBOARDING_PROFILE);

  const panelOpacity = useSharedValue(0);
  const panelTranslateY = useSharedValue(16);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
    transform: [{ translateY: panelTranslateY.value }],
  }));

  useEffect(() => {
    panelOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    panelTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, [panelOpacity, panelTranslateY]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!userId) {
        return;
      }
      try {
        const data = await getMainOnboardingProfile(userId);
        if (isMounted && data) {
          setProfile(data);
        }
      } catch {
        if (isMounted) {
          setProfile(EMPTY_ONBOARDING_PROFILE);
        }
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const attributes = useMemo(() => buildAttributes(profile), [profile]);
  const rank = useMemo(() => getRank(attributes), [attributes]);

  const handleContinue = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;
    router.replace("/welcome" as Href);
  }, [router]);

  if (!isLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  if (!isSignedIn) {
    return <Redirect href={"/onboarding" as Href} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.noticeBox, panelStyle]}>
          <Text style={styles.noticeLabel}>SYSTEM NOTICE</Text>
          <Text style={styles.noticeText}>ASSESSMENT COMPLETE. Analyzing hunter profile...</Text>
        </Animated.View>

        <Animated.View style={[styles.rankPanel, panelStyle]}>
          <Text style={styles.rankTitle}>RANK</Text>
          <Text style={styles.rankValue}>{rank}</Text>
        </Animated.View>

        <Animated.View style={[styles.attrCard, panelStyle]}>
          <Text style={styles.attrTitle}>BASE ATTRIBUTES</Text>
          {attributes.map((attr) => (
            <View key={attr.key} style={styles.attrRow}>
              <View style={styles.attrTop}>
                <Text style={styles.attrKey}>{attr.key}</Text>
                <Text style={styles.attrValue}>{attr.value}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(attr.value / 20) * 100}%` }]} />
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={panelStyle}>
          <AuthPrimaryButton label="Start the journey" onPress={handleContinue} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    gap: 22,
  },
  noticeBox: {
    borderLeftWidth: 2,
    borderLeftColor: onboardingTheme.accent,
    backgroundColor: onboardingTheme.surface,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  noticeLabel: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 2,
  },
  noticeText: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accent,
    fontSize: 14,
    lineHeight: 20,
  },
  rankPanel: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 26,
    gap: 8,
  },
  rankTitle: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 14,
    letterSpacing: 3,
  },
  rankValue: {
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    fontSize: 56,
    lineHeight: 62,
  },
  attrCard: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  attrTitle: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 18,
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  attrRow: {
    gap: 5,
  },
  attrTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attrKey: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  attrValue: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 12,
  },
  barTrack: {
    height: 6,
    backgroundColor: "#1f1f1f",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: onboardingTheme.accent,
    borderRadius: 999,
  },
});
