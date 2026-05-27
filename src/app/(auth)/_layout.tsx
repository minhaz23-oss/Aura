import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, type Href } from "expo-router";

import { onboardingTheme } from "@/constants/onboarding-theme";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={"/(tabs)" as Href} />;
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
