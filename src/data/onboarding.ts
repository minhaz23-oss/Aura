import type { OnboardingPhase } from "@/types/onboarding";

export const ONBOARDING_PHASES: OnboardingPhase[] = [
  {
    step: 1,
    phaseLabel: "PHASE_01: SELECTION",
    headline: "YOU ARE CHOSEN",
    statusLine: "HUNTER PROTOCOL ACTIVATED",
    narrative:
      "Among millions, your signal was detected. The System has marked you as a candidate. Will you answer the call?",
    footer: "AWAKENING SEQUENCE FOLLOWS",
    icon: "star",
  },
  {
    step: 2,
    phaseLabel: "PHASE_02: INITIATION",
    headline: "RISE, HUNTER",
    statusLine: "NEURAL SYNC IN PROGRESS",
    narrative:
      "Ordinary limits no longer apply to you. Each rep, each quest, each choice forges the hunter you are becoming.",
    footer: "SYSTEM CALIBRATION CONTINUES",
    icon: "shield",
  },
  {
    step: 3,
    phaseLabel: "PHASE_03: AWAKENING",
    headline: "ARISE AND CONQUER",
    statusLine: "SYSTEM INITIALIZATION COMPLETE",
    narrative:
      "The limits of your current form are being exceeded. To proceed is to leave behind the ordinary. Do you accept the evolution?",
    footer: "IDENTITY VERIFICATION REQUIRED NEXT",
    icon: "bolt",
  },
];

export const ONBOARDING_TOTAL = ONBOARDING_PHASES.length;
