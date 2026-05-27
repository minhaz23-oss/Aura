import { Easing } from "react-native-reanimated";

export const onboardingAnimation = {
  exit: {
    duration: 280,
    offsetX: -32,
    scale: 0.97,
    easing: Easing.bezier(0.55, 0, 1, 0.45),
  },
  enter: {
    duration: 400,
    offsetX: 40,
    scale: 0.97,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  },
  progress: {
    duration: 450,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  },
} as const;
