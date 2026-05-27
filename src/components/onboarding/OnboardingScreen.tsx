import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  type AnimatedStyle,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { GlowingText } from "@/components/onboarding/GlowingText";
import { appFonts } from "@/constants/fonts";
import { PhaseIcon } from "@/components/onboarding/PhaseIcon";
import { TypewriterText } from "@/components/onboarding/TypewriterText";
import { onboardingTheme } from "@/constants/onboarding-theme";
import type { OnboardingPhase } from "@/types/onboarding";

type OnboardingScreenProps = {
  phase: OnboardingPhase;
  onNext: () => void;
  nextDisabled?: boolean;
  progress: SharedValue<number>;
  contentStyle: AnimatedStyle<ViewStyle>;
};

export function OnboardingScreen({
  phase,
  onNext,
  nextDisabled = false,
  progress,
  contentStyle,
}: OnboardingScreenProps) {
  const shimmer = useSharedValue(0);

  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400 }),
        withTiming(0, { duration: 1400 }),
      ),
      -1,
      false,
    );
  }, [shimmer, phase.step]);

  useEffect(() => {
    headerOpacity.value = 0;
    headerOpacity.value = withTiming(1, { duration: 320 });
  }, [headerOpacity, phase.step]);

  const headerFadeStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + shimmer.value * 0.45,
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerFadeStyle]}>
        <Text style={styles.phaseLabel}>{phase.phaseLabel}</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, progressFillStyle, shimmerStyle]}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.hero, contentStyle]}>
        <PhaseIcon icon={phase.icon} />
        <GlowingText>{phase.headline}</GlowingText>

        <View style={styles.statusRow}>
          <View style={styles.statusLine} />
          <Text style={styles.statusText}>{phase.statusLine}</Text>
          <View style={styles.statusLine} />
        </View>

        <View style={styles.narrativeBox}>
          <View style={styles.narrativeAccent} />
          <TypewriterText key={phase.step} text={phase.narrative} />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          onPress={onNext}
          disabled={nextDisabled}
          style={({ pressed }) => [
            styles.nextButton,
            onboardingTheme.glow.button,
            nextDisabled && styles.nextButtonDisabled,
            pressed && !nextDisabled && styles.nextButtonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </Pressable>

        <Text style={styles.footerHint}>{phase.footer}</Text>
      </View>
    </View>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const body = {
  fontFamily: appFonts.regular,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: "space-between",
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
    height: "100%",
    backgroundColor: onboardingTheme.accent,
    borderRadius: 1,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
    marginTop: 4,
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
  narrativeBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: onboardingTheme.surface,
    borderRadius: onboardingTheme.radius,
    paddingVertical: 20,
    paddingRight: 20,
    paddingLeft: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  narrativeAccent: {
    width: 2,
    backgroundColor: onboardingTheme.accent,
    marginRight: 14,
    borderRadius: 1,
  },
  footer: {
    alignItems: "center",
    gap: 20,
  },
  nextButton: {
    width: "100%",
    backgroundColor: onboardingTheme.background,
    borderWidth: 1,
    borderColor: onboardingTheme.accent,
    borderRadius: onboardingTheme.radius,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.55,
  },
  nextButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    ...mono,
    color: onboardingTheme.buttonText,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  footerHint: {
    ...body,
    color: onboardingTheme.accentDim,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: "center",
    lineHeight: 14,
    maxWidth: 280,
  },
});
