import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type TabConfig = {
  routeName: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const TABS: TabConfig[] = [
  { routeName: "index", label: "HOME", icon: "view-grid-outline" },
  { routeName: "quests", label: "QUESTS", icon: "sword-cross" },
  { routeName: "stats", label: "STATS", icon: "chart-line" },
  { routeName: "profile", label: "PROFILE", icon: "account-outline" },
];

export function HunterTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((item) => item.routeName === route.name);
        if (!tab) {
          return null;
        }

        const isFocused = state.index === index;
        const color = isFocused ? onboardingTheme.accent : "#5a5a5a";

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
          >
            <MaterialCommunityIcons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontFamily: appFonts.semiBold,
    color: "#5a5a5a",
    fontSize: 9,
    letterSpacing: 1,
  },
  labelActive: {
    color: onboardingTheme.accent,
  },
});
