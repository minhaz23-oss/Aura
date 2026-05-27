import { Pressable, StyleSheet, Text } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type AuthPrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
}: AuthPrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        onboardingTheme.glow.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: onboardingTheme.background,
    borderWidth: 1,
    borderColor: onboardingTheme.accent,
    borderRadius: onboardingTheme.radius,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...mono,
    color: onboardingTheme.buttonText,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
