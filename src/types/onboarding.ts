export type OnboardingIcon =
  | "bolt"
  | "star"
  | "shield"
  | "flame"
  | "verify";

export type OnboardingPhase = {
  step: number;
  phaseLabel: string;
  headline: string;
  statusLine: string;
  narrative: string;
  footer: string;
  icon: OnboardingIcon;
};
