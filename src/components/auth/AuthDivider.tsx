import { StyleSheet, Text, View } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

export function AuthDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: onboardingTheme.line,
  },
  text: {
    ...mono,
    color: onboardingTheme.accentDim,
    fontSize: 10,
    letterSpacing: 2,
  },
});
