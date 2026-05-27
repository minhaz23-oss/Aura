import { useEffect } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

const AnimatedText = Animated.createAnimatedComponent(Text);

type GlowingTextProps = {
  children: string;
  style?: TextStyle;
};

export function GlowingText({ children, style }: GlowingTextProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 2200 }),
        withTiming(1, { duration: 2200 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <AnimatedText
      style={[
        styles.headline,
        onboardingTheme.glow.text,
        style,
        animatedGlow,
      ]}
    >
      {children}
    </AnimatedText>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
