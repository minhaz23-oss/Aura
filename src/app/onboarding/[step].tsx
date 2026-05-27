import { Redirect, type Href, useLocalSearchParams } from "expo-router";

export default function OnboardingStepRedirect() {
  const { step } = useLocalSearchParams<{ step: string }>();

  return (
    <Redirect
      href={{
        pathname: "/onboarding",
        params: step ? { step } : undefined,
      } as Href}
    />
  );
}
