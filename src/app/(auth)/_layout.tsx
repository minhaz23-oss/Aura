import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";

import { onboardingTheme } from "@/constants/onboarding-theme";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  if (isSignedIn) {
    return <Redirect href={"/" as Href} />;
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

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
});
