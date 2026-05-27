import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

type AuthTextFieldProps = {
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  value?: string;
  onChangeText?: (value: string) => void;
  editable?: boolean;
};

export function AuthTextField({
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  value,
  onChangeText,
  editable = true,
}: AuthTextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !editable && styles.inputRowDisabled]}>
        <View style={styles.accent} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={onboardingTheme.accentDim}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    width: "100%",
  },
  label: {
    ...mono,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: onboardingTheme.surface,
    borderRadius: onboardingTheme.radius,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    overflow: "hidden",
  },
  inputRowDisabled: {
    opacity: 0.6,
  },
  accent: {
    width: 2,
    backgroundColor: onboardingTheme.accent,
  },
  input: {
    flex: 1,
    fontFamily: appFonts.regular,
    color: onboardingTheme.accent,
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
});
