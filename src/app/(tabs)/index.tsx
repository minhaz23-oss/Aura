import { useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import { getMainOnboardingProfile, type UserOnboardingProfile } from "@/lib/user-onboarding";

export default function HunterHomeScreen() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.id) {
        return;
      }
      const stored = await getMainOnboardingProfile(user.id);
      if (isMounted) {
        setProfile(stored);
      }
    }
    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const attributeValues = useMemo(() => {
    const days = Number(profile?.workoutDaysPerWeek ?? 3) || 3;
    const duration = Number(profile?.workoutDurationMinutes ?? 30) || 30;
    const sleep = Number(profile?.sleepHours ?? 7) || 7;

    return {
      str: Math.min(20, Math.max(6, Math.round(days * 2 + duration / 20))),
      agi: Math.min(20, Math.max(6, Math.round(sleep + 4))),
      end: Math.min(20, Math.max(6, Math.round(days + sleep))),
      vit: Math.min(20, Math.max(6, Math.round((duration / 15 + sleep) * 0.8))),
    };
  }, [profile?.sleepHours, profile?.workoutDaysPerWeek, profile?.workoutDurationMinutes]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topIconWrap}>
            <Text style={styles.topIconText}>S</Text>
          </View>
          <Text style={styles.topTitle}>THE SYSTEM</Text>
          <View style={styles.topIconWrap}>
            <Text style={styles.topIconText}>◈</Text>
          </View>
        </View>

        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>E</Text>
            </View>
            <View>
              <Text style={styles.playerLabel}>PLAYER</Text>
              <Text style={styles.playerLevel}>LEVEL 1</Text>
            </View>
          </View>

          <View style={styles.expRow}>
            <Text style={styles.expLabel}>EXPERIENCE</Text>
            <Text style={styles.expValue}>120 / 1000</Text>
          </View>
          <View style={styles.expTrack}>
            <View style={styles.expFill} />
          </View>

          <View style={styles.attrGrid}>
            <View style={styles.attrBox}>
              <Text style={styles.attrKey}>STR</Text>
              <Text style={styles.attrValue}>{attributeValues.str}</Text>
            </View>
            <View style={styles.attrBox}>
              <Text style={styles.attrKey}>AGI</Text>
              <Text style={styles.attrValue}>{attributeValues.agi}</Text>
            </View>
            <View style={styles.attrBox}>
              <Text style={styles.attrKey}>END</Text>
              <Text style={styles.attrValue}>{attributeValues.end}</Text>
            </View>
            <View style={styles.attrBox}>
              <Text style={styles.attrKey}>VIT</Text>
              <Text style={styles.attrValue}>{attributeValues.vit}</Text>
            </View>
          </View>
        </View>

        <View style={styles.questCard}>
          <Text style={styles.questTitle}>DAILY QUEST</Text>
          <View style={styles.questNotice}>
            <Text style={styles.questName}>Iron Body Training</Text>
            <Text style={styles.questDesc}>Complete the routine to avoid the penalty zone.</Text>
          </View>

          <View style={styles.questTaskRow}>
            <Text style={styles.questTask}>Push-ups</Text>
            <Text style={styles.questTaskValue}>0 / 100</Text>
          </View>
          <View style={styles.questTaskRow}>
            <Text style={styles.questTask}>Sit-ups</Text>
            <Text style={styles.questTaskValue}>0 / 100</Text>
          </View>
          <View style={styles.questTaskRow}>
            <Text style={styles.questTask}>Running</Text>
            <Text style={styles.questTaskValue}>0 / 10km</Text>
          </View>

          <Pressable style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>ACCEPT QUEST</Text>
          </Pressable>
        </View>

        <View style={styles.bottomBar}>
          <Text style={[styles.bottomNavText, styles.bottomNavActive]}>HOME</Text>
          <Text style={styles.bottomNavText}>QUESTS</Text>
          <Text style={styles.bottomNavText}>STATS</Text>
          <Text style={styles.bottomNavText}>LOGS</Text>
          <Text style={styles.bottomNavText}>PROFILE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 14,
    backgroundColor: onboardingTheme.background,
  },
  topBar: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    minHeight: 58,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  topIconWrap: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  topIconText: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 11,
  },
  topTitle: {
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    letterSpacing: 2.6,
    fontSize: 28,
  },
  playerCard: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 8,
    backgroundColor: onboardingTheme.surface,
    padding: 12,
    gap: 12,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 18,
  },
  playerLabel: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 22,
    letterSpacing: 1.2,
  },
  playerLevel: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  expRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expLabel: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  expValue: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 10,
  },
  expTrack: {
    height: 5,
    backgroundColor: "#1e1e1e",
    borderRadius: 999,
    overflow: "hidden",
  },
  expFill: {
    height: "100%",
    width: "12%",
    backgroundColor: onboardingTheme.accent,
  },
  attrGrid: {
    flexDirection: "row",
    gap: 6,
  },
  attrBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  attrKey: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  attrValue: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 14,
  },
  questCard: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 8,
    backgroundColor: onboardingTheme.surface,
    padding: 12,
    gap: 10,
  },
  questTitle: {
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    fontSize: 28,
    letterSpacing: 1.3,
  },
  questNotice: {
    borderLeftWidth: 2,
    borderLeftColor: onboardingTheme.accent,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  questName: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 16,
  },
  questDesc: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentDim,
    fontSize: 13,
    lineHeight: 18,
  },
  questTaskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: onboardingTheme.line,
    paddingBottom: 6,
  },
  questTask: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentMuted,
    fontSize: 14,
  },
  questTaskValue: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 14,
  },
  acceptButton: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: onboardingTheme.accent,
    backgroundColor: "#eeeeee",
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    fontFamily: appFonts.semiBold,
    color: "#000000",
    fontSize: 12,
    letterSpacing: 1.8,
  },
  bottomBar: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    minHeight: 56,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomNavText: {
    fontFamily: appFonts.semiBold,
    color: "#5a5a5a",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  bottomNavActive: {
    color: onboardingTheme.accent,
  },
});
