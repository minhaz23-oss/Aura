import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, type Href } from "expo-router";
import { useEffect, useState } from "react";

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
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/onboarding" as Href} />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href={"/(main-onboarding)" as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: onboardingTheme.background },
      }}
    />
  );
}
