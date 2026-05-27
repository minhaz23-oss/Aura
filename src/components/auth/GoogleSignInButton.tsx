import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type GoogleSignInButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({
  onPress,
  disabled = false,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons
        name="google"
        size={20}
        color={onboardingTheme.accent}
      />
      <Text style={styles.label}>Continue with Google</Text>
    </Pressable>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: onboardingTheme.surface,
    borderRadius: onboardingTheme.radius,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
