import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { type Href, useRouter } from "expo-router";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { onboardingAnimation } from "@/constants/onboarding-animation";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { ONBOARDING_PHASES, ONBOARDING_TOTAL } from "@/data/onboarding";

type OnboardingFlowProps = {
  initialStep?: number;
};

export function OnboardingFlow({ initialStep = 1 }: OnboardingFlowProps) {
  const router = useRouter();
  const clampedInitial = Math.min(
    Math.max(initialStep, 1),
    ONBOARDING_TOTAL,
  );
  const [step, setStep] = useState(clampedInitial);
  const [nextDisabled, setNextDisabled] = useState(false);

  const phase = ONBOARDING_PHASES[step - 1];

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const progress = useSharedValue(clampedInitial / ONBOARDING_TOTAL);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const finishTransition = useCallback(() => {
    setNextDisabled(false);
  }, []);

  const playEnter = useCallback(() => {
    const { enter } = onboardingAnimation;
    translateX.value = enter.offsetX;
    opacity.value = 0;
    scale.value = enter.scale;

    translateX.value = withTiming(0, {
      duration: enter.duration,
      easing: enter.easing,
    });
    opacity.value = withTiming(1, {
      duration: enter.duration,
      easing: enter.easing,
    });
    scale.value = withTiming(
      1,
      { duration: enter.duration, easing: enter.easing },
      (finished) => {
        if (finished) {
          runOnJS(finishTransition)();
        }
      },
    );
  }, [finishTransition, opacity, scale, translateX]);

  const navigateToAuth = useCallback(() => {
    router.replace("/(auth)/sign-in" as Href);
  }, [router]);

  const advanceStep = useCallback(() => {
    const nextStep = step + 1;
    setStep(nextStep);
    progress.value = withTiming(nextStep / ONBOARDING_TOTAL, {
      duration: onboardingAnimation.progress.duration,
      easing: onboardingAnimation.progress.easing,
    });
    playEnter();
  }, [playEnter, progress, step, translateX]);

  const handleNext = useCallback(() => {
    if (nextDisabled) {
      return;
    }

    if (step >= ONBOARDING_TOTAL) {
      navigateToAuth();
      return;
    }

    setNextDisabled(true);
    const { exit } = onboardingAnimation;

    translateX.value = withTiming(exit.offsetX, {
      duration: exit.duration,
      easing: exit.easing,
    });
    opacity.value = withTiming(0, {
      duration: exit.duration,
      easing: exit.easing,
    });
    scale.value = withTiming(
      exit.scale,
      { duration: exit.duration, easing: exit.easing },
      (finished) => {
        if (finished) {
          runOnJS(advanceStep)();
        }
      },
    );
  }, [advanceStep, nextDisabled, opacity, scale, translateX]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <OnboardingScreen
          phase={phase}
          onNext={handleNext}
          nextDisabled={nextDisabled}
          progress={progress}
          contentStyle={contentStyle}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  container: {
    flex: 1,
  },
});
