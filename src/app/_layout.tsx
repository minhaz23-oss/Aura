import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_600SemiBold,
  Exo2_700Bold,
  Exo2_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/exo-2";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { clerkPublishableKey } from "@/lib/clerk";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Exo2_400Regular,
    Exo2_500Medium,
    Exo2_600SemiBold,
    Exo2_700Bold,
    Exo2_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: onboardingTheme.background }}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: onboardingTheme.background },
          }}
        >
          <Stack.Screen name="onboarding" options={{ animation: "none" }} />
          <Stack.Screen name="(auth)" options={{ animation: "none" }} />
          <Stack.Screen name="(main-onboarding)" options={{ animation: "none" }} />
          <Stack.Screen name="assessment" options={{ animation: "none" }} />
          <Stack.Screen name="welcome" options={{ animation: "none" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
          <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
        </Stack>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
