import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { onboardingTheme } from "@/constants/onboarding-theme";

type TypewriterTextProps = {
  text: string;
  speedMs?: number;
};

export function TypewriterText({ text, speedMs = 22 }: TypewriterTextProps) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return <Text style={styles.body}>{visible}</Text>;
}

const styles = StyleSheet.create({
  body: {
    color: onboardingTheme.accent,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 24,
    opacity: 0.92,
  },
});
