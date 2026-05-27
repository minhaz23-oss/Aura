/** Onboarding / awakening screen tokens (from reference design). */
export const onboardingTheme = {
  background: "#000000",
  accent: "#ffffff",
  accentMuted: "#ffffff",
  accentDim: "rgba(255, 255, 255, 0.7)",
  surface: "#000000",
  buttonText: "#ffffff",
  progressTrack: "rgba(255, 255, 255, 0.2)",
  line: "rgba(255, 255, 255, 0.4)",
  radius: 8,
  glow: {
    text: {
      textShadowColor: "rgba(255, 255, 255, 0.45)",
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 24,
    },
    icon: {
      shadowColor: "#ffffff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 12,
    },
    button: {
      shadowColor: "#ffffff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
    },
  },
} as const;
