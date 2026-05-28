import { Redirect, type Href } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { onboardingTheme } from "@/constants/onboarding-theme";
import { isMainOnboardingComplete } from "@/lib/user-onboarding";

export default function Index() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkOnboarding() {
      if (!isSignedIn || !userId) {
        if (!isMounted) {
          return;
        }
        setIsOnboardingComplete(false);
        setIsCheckingOnboarding(false);
        return;
      }

      const complete = await isMainOnboardingComplete(userId);
      if (!isMounted) {
        return;
      }
      setIsOnboardingComplete(complete);
      setIsCheckingOnboarding(false);
    }

    void checkOnboarding();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, userId]);

  if (!isLoaded || isCheckingOnboarding) {
    return <View style={styles.loadingScreen} />;
  }

  if (!isSignedIn) {
    return <Redirect href={"/onboarding" as Href} />;
  }

  return <Redirect href={(isOnboardingComplete ? "/welcome" : "/(main-onboarding)") as Href} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
});
