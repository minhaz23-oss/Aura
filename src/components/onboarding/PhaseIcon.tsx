import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";

import { onboardingTheme } from "@/constants/onboarding-theme";
import type { OnboardingIcon } from "@/types/onboarding";

const ICON_MAP: Record<
  OnboardingIcon,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  star: "star-four-points",
  shield: "shield-sword",
  bolt: "lightning-bolt",
  flame: "fire",
  verify: "shield-key",
};

type PhaseIconProps = {
  icon: OnboardingIcon;
  size?: number;
};

export function PhaseIcon({ icon, size = 48 }: PhaseIconProps) {
  const name = ICON_MAP[icon];
  const glowSize = size * 1.35;

  return (
    <View
      style={[
        styles.wrap,
        onboardingTheme.glow.icon,
        { width: size + 16, height: size + 16 },
      ]}
    >
      <MaterialCommunityIcons
        name={name}
        size={glowSize}
        color={onboardingTheme.accent}
        style={styles.glowLayer}
      />
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={onboardingTheme.accent}
        style={styles.iconLayer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  glowLayer: {
    position: "absolute",
    opacity: 0.22,
  },
  iconLayer: {
    opacity: 1,
  },
});
