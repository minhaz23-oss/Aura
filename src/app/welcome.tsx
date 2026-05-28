import { useAuth } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Redirect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

const auraLogo = require("../../assets/Aura_logo.jpg");

const TITLE = "WELCOME TO AURA";
const SUBTITLE = "Let's become better";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const hasNavigatedRef = useRef(false);

  const logoScale = useSharedValue(0.55);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(16);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(12);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));


  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, [logoOpacity, logoScale]);

  useEffect(() => {
    const titleDelay = setTimeout(() => {
      titleOpacity.value = withTiming(1, {
        duration: 520,
        easing: Easing.out(Easing.quad),
      });
      titleTranslateY.value = withTiming(0, {
        duration: 520,
        easing: Easing.out(Easing.quad),
      });
    }, 520);

    const subtitleDelay = setTimeout(() => {
      subtitleOpacity.value = withTiming(1, {
        duration: 520,
        easing: Easing.out(Easing.quad),
      });
      subtitleTranslateY.value = withTiming(0, {
        duration: 520,
        easing: Easing.out(Easing.quad),
      });
    }, 920);

    return () => {
      clearTimeout(titleDelay);
      clearTimeout(subtitleDelay);
    };
  }, [subtitleOpacity, subtitleTranslateY, titleOpacity, titleTranslateY]);

  const handleContinue = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;
    router.replace("/(tabs)" as Href);
  }, [router]);

  useEffect(() => {
    const autoContinueTimer = setTimeout(() => {
      handleContinue();
    }, 2600);

    return () => {
      clearTimeout(autoContinueTimer);
    };
  }, [handleContinue]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/onboarding" as Href} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image source={auraLogo} style={styles.logo} contentFit="contain" />
        </Animated.View>

        <View style={styles.textBlock}>
          <Animated.View style={titleStyle}>
            <Text style={styles.title} numberOfLines={3}>
              {TITLE}
            </Text>
          </Animated.View>
          <Animated.View style={[styles.subtitleWrap, subtitleStyle]}>
            <Text style={styles.subtitle}>{SUBTITLE}</Text>
          </Animated.View>
        </View>
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
    paddingHorizontal: 28,
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
    gap: 36,
  },
  logoWrap: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  textBlock: {
    width: "100%",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 4,
  },
  title: {
    width: "100%",
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    fontSize: 26,
    letterSpacing: 1.2,
    textAlign: "center",
    textTransform: "uppercase",
    ...onboardingTheme.glow.text,
  },
  subtitleWrap: {
    width: "100%",
    alignItems: "center",
    flexShrink: 0,
  },
  subtitle: {
    width: "100%",
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentDim,
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 12,
  },
});
