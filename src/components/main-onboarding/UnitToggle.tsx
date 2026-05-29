import { Pressable, StyleSheet, Text, View } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type UnitToggleProps<T extends string> = {
  left: T;
  right: T;
  leftLabel: string;
  rightLabel: string;
  value: T;
  onChange: (value: T) => void;
};

export function UnitToggle<T extends string>({
  left,
  right,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: UnitToggleProps<T>) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange(left)}
        style={[styles.option, value === left && styles.optionActive]}
      >
        <Text style={[styles.label, value === left && styles.labelActive]}>{leftLabel}</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(right)}
        style={[styles.option, value === right && styles.optionActive]}
      >
        <Text style={[styles.label, value === right && styles.labelActive]}>{rightLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  optionActive: {
    backgroundColor: onboardingTheme.accent,
  },
  label: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  labelActive: {
    color: "#000000",
  },
});
