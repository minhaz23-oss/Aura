import { useLocalSearchParams } from "expo-router";

import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingIndex() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  const initialStep = step ? Number(step) : 1;

  return <OnboardingFlow initialStep={initialStep} />;
}
