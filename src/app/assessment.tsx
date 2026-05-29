import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { saveHunterAssessment, type HunterAssessment } from "@/lib/user-onboarding";

const HUNTER_RANK = "E";
/** Starting stats rolled for new hunters */
const STAT_VALUE_MIN = 1;
const STAT_VALUE_MAX = 5;
/** Progress bars always scale against 100 */
const STAT_BAR_MAX = 100;

type Attribute = {
  key: string;
  label: string;
  value: number;
};

const BASE_ATTRIBUTES = [
  { key: "strength", label: "Strength" },
  { key: "agility", label: "Agility" },
  { key: "endurance", label: "Endurance" },
  { key: "vitality", label: "Vitality" },
] as const;

function randomStatValue() {
  return (
    Math.floor(Math.random() * (STAT_VALUE_MAX - STAT_VALUE_MIN + 1)) + STAT_VALUE_MIN
  );
}

function buildStarterAttributes(): Attribute[] {
  return BASE_ATTRIBUTES.map((attr) => ({
    key: attr.key,
    label: attr.label,
    value: randomStatValue(),
  }));
}

function toAssessmentPayload(attributes: Attribute[]): HunterAssessment {
  const byKey = Object.fromEntries(attributes.map((a) => [a.key, a.value]));
  return {
    rank: HUNTER_RANK,
    strength: byKey.strength ?? 0,
    agility: byKey.agility ?? 0,
    endurance: byKey.endurance ?? 0,
    vitality: byKey.vitality ?? 0,
    assessedAt: new Date().toISOString(),
  };
}

export default function AssessmentScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const hasNavigatedRef = useRef(false);
  const [attributes] = useState(buildStarterAttributes);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleContinue = useCallback(async () => {
    if (hasNavigatedRef.current || !userId || isSaving) {
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await saveHunterAssessment(userId, toAssessmentPayload(attributes));
      hasNavigatedRef.current = true;
      router.replace("/welcome" as Href);
    } catch {
      setErrorMessage("Unable to save assessment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [attributes, isSaving, router, userId]);

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
          <Text style={styles.rankValue}>{HUNTER_RANK}</Text>
        </Animated.View>

        <Animated.View style={[styles.attrCard, panelStyle]}>
          <Text style={styles.attrTitle}>BASE ATTRIBUTES</Text>
          {attributes.map((attr) => (
            <View key={attr.key} style={styles.attrRow}>
              <View style={styles.attrTop}>
                <Text style={styles.attrKey}>{attr.label}</Text>
                <Text style={styles.attrValue}>{attr.value}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[styles.barFill, { width: `${(attr.value / STAT_BAR_MAX) * 100}%` }]}
                />
              </View>
            </View>
          ))}
        </Animated.View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Animated.View style={panelStyle}>
          <AuthPrimaryButton
            label={isSaving ? "SAVING..." : "Start the journey"}
            onPress={handleContinue}
            disabled={isSaving}
          />
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
    letterSpacing: 0.4,
    textTransform: "capitalize",
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
  errorText: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 12,
    textAlign: "center",
  },
});
