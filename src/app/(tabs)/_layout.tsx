import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { HunterTabBar } from "@/components/tabs/HunterTabBar";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { isMainOnboardingComplete } from "@/lib/user-onboarding";

export default function TabsLayout() {
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

  if (!isOnboardingComplete) {
    return <Redirect href={"/(main-onboarding)" as Href} />;
  }

  return (
    <Tabs
      tabBar={(props) => <HunterTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
        sceneStyle: { backgroundColor: onboardingTheme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="quests" options={{ title: "Quests" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
});
