import { useAuth } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Redirect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

const auraLogo = require("../../assets/Aura_logo.jpg");

const TITLE = "WELCOME TO AURA";
const SUBTITLE = "Let's become better";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [typedTitle, setTypedTitle] = useState("");
  const [showButton, setShowButton] = useState(false);

  const logoScale = useSharedValue(0.55);
  const logoOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(14);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(16);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, [logoOpacity, logoScale]);

  useEffect(() => {
    let index = 0;
    let typeTimer: ReturnType<typeof setInterval> | null = null;

    const startDelay = setTimeout(() => {
      typeTimer = setInterval(() => {
        index += 1;
        setTypedTitle(TITLE.slice(0, index));
        if (index >= TITLE.length) {
          if (typeTimer) {
            clearInterval(typeTimer);
          }

          subtitleOpacity.value = withTiming(1, {
            duration: 500,
            easing: Easing.out(Easing.quad),
          });
          subtitleTranslateY.value = withTiming(0, {
            duration: 500,
            easing: Easing.out(Easing.quad),
          });

          buttonOpacity.value = withDelay(
            350,
            withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }),
          );
          buttonTranslateY.value = withDelay(
            350,
            withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) }),
          );

          setTimeout(() => setShowButton(true), 350);
        }
      }, 45);
    }, 650);

    return () => {
      clearTimeout(startDelay);
      if (typeTimer) {
        clearInterval(typeTimer);
      }
    };
  }, [buttonOpacity, buttonTranslateY, subtitleOpacity, subtitleTranslateY]);

  const handleContinue = useCallback(() => {
    router.replace("/(tabs)" as Href);
  }, [router]);

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
          <Text style={styles.title} numberOfLines={3}>
            {typedTitle}
          </Text>
          <Animated.View style={[styles.subtitleWrap, subtitleStyle]}>
            <Text style={styles.subtitle}>{SUBTITLE}</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.buttonWrap, buttonStyle]}>
          <AuthPrimaryButton
            label="Let's Goo!"
            onPress={handleContinue}
            disabled={!showButton}
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
  buttonWrap: {
    width: "100%",
    marginTop: 8,
  },
});
