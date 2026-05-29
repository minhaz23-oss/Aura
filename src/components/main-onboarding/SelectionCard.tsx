import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

export type SelectionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type SelectionCardProps = {
  title: string;
  subtitle: string;
  icon: SelectionIconName;
  selected: boolean;
  onPress: () => void;
};

export function SelectionCard({
  title,
  subtitle,
  icon,
  selected,
  onPress,
}: SelectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={onboardingTheme.accent}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: "#0d0d0d",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardSelected: {
    borderColor: onboardingTheme.accent,
    backgroundColor: "#141414",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentDim,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: onboardingTheme.accent,
    backgroundColor: onboardingTheme.accent,
  },
  checkmark: {
    fontFamily: appFonts.bold,
    color: "#000000",
    fontSize: 11,
  },
});
