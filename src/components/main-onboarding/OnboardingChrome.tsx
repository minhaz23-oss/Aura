import { Pressable, StyleSheet, Text, View } from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type OnboardingChromeProps = {
  phase: number;
  totalPhases: number;
  canGoBack: boolean;
  onBack: () => void;
};

export function OnboardingChrome({
  phase,
  totalPhases,
  canGoBack,
  onBack,
}: OnboardingChromeProps) {
  const phaseLabel = String(phase).padStart(2, "0");
  const totalLabel = String(totalPhases).padStart(2, "0");

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onBack}
        disabled={!canGoBack}
        style={[styles.backButton, !canGoBack && styles.backButtonDisabled]}
        hitSlop={12}
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <View style={styles.progressRow}>
        {Array.from({ length: totalPhases }, (_, index) => {
          const isActive = index + 1 <= phase;
          return (
            <View
              key={index}
              style={[styles.progressSegment, isActive && styles.progressSegmentActive]}
            />
          );
        })}
      </View>

      <Text style={styles.phaseText}>
        PHASE {phaseLabel}/{totalLabel}
      </Text>
    </View>
  );
}

type SystemNoticeProps = {
  title: string;
  message: string;
};

export function SystemNotice({ title, message }: SystemNoticeProps) {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeAccent} />
      <View style={styles.noticeBody}>
        <Text style={styles.noticeTitle}>⚡ {title}</Text>
        <Text style={styles.noticeMessage}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonDisabled: {
    opacity: 0.25,
  },
  backIcon: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 20,
  },
  progressRow: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: onboardingTheme.progressTrack,
    borderRadius: 999,
  },
  progressSegmentActive: {
    backgroundColor: onboardingTheme.accent,
  },
  phaseText: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 1.2,
    minWidth: 86,
    textAlign: "right",
  },
  notice: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: onboardingTheme.surface,
    marginBottom: 20,
  },
  noticeAccent: {
    width: 2,
    backgroundColor: onboardingTheme.accent,
  },
  noticeBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  noticeTitle: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  noticeMessage: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentDim,
    fontSize: 13,
  },
});
