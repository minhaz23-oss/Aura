import { useUser } from "@clerk/clerk-expo";
import { type Href, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { GlowingText } from "@/components/onboarding/GlowingText";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import {
  EMPTY_ONBOARDING_PROFILE,
  saveMainOnboardingProfile,
  type UserOnboardingProfile,
} from "@/lib/user-onboarding";

type FieldKey = keyof UserOnboardingProfile;

type BaseFieldConfig = {
  key: FieldKey;
  label: string;
  subtitle: string;
  required?: boolean;
};

type TextFieldConfig = BaseFieldConfig & {
  kind: "text";
  placeholder: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
};

type SelectFieldConfig = BaseFieldConfig & {
  kind: "select";
  options: string[];
};

type FieldConfig = TextFieldConfig | SelectFieldConfig;

const MOTIVATIONAL_QUOTES = [
  "Small steps done daily forge unbeatable hunters.",
  "Discipline beats motivation when the day gets hard.",
  "Progress is built in quiet reps no one sees.",
  "Your future rank is hidden inside today's effort.",
  "Consistency is the real awakening power.",
  "The strongest version of you starts now.",
  "A focused mind creates a stronger body.",
];

const ONBOARDING_FIELDS: FieldConfig[] = [
  {
    key: "heightCm",
    label: "HEIGHT_CM",
    subtitle: "Tell us your current height.",
    required: true,
    kind: "text",
    placeholder: "175",
    keyboardType: "number-pad",
  },
  {
    key: "weightKg",
    label: "WEIGHT_KG",
    subtitle: "Tell us your current weight.",
    required: true,
    kind: "text",
    placeholder: "70",
    keyboardType: "number-pad",
  },
  {
    key: "sleepHours",
    label: "SLEEP_HOURS",
    subtitle: "How many hours do you sleep daily?",
    required: true,
    kind: "text",
    placeholder: "7.5",
    keyboardType: "decimal-pad",
  },
  {
    key: "age",
    label: "AGE",
    subtitle: "Your age helps personalize your plan.",
    kind: "text",
    placeholder: "26",
    keyboardType: "number-pad",
  },
  {
    key: "gender",
    label: "GENDER",
    subtitle: "Select the option you identify with.",
    kind: "select",
    options: ["Male", "Female", "Other", "Prefer not to say"],
  },
  {
    key: "activityLevel",
    label: "ACTIVITY_LEVEL",
    subtitle: "How active are you currently?",
    kind: "select",
    options: ["Beginner", "Moderate", "Advanced"],
  },
  {
    key: "primaryGoal",
    label: "PRIMARY_GOAL",
    subtitle: "What is your main target right now?",
    required: true,
    kind: "select",
    options: ["Fat loss", "Muscle gain", "Endurance", "General fitness", "Habit building"],
  },
  {
    key: "targetWeightKg",
    label: "TARGET_WEIGHT_KG",
    subtitle: "Optional target body weight.",
    kind: "text",
    placeholder: "65",
    keyboardType: "number-pad",
  },
  {
    key: "workoutDaysPerWeek",
    label: "WORKOUT_DAYS_PER_WEEK",
    subtitle: "How many training days per week?",
    kind: "select",
    options: ["2", "3", "4", "5", "6+"],
  },
  {
    key: "workoutDurationMinutes",
    label: "WORKOUT_DURATION_MINUTES",
    subtitle: "Preferred session duration.",
    kind: "select",
    options: ["20", "30", "45", "60", "90"],
  },
  {
    key: "dietPreference",
    label: "DIET_PREFERENCE",
    subtitle: "Choose your nutrition style.",
    kind: "select",
    options: ["Balanced", "High protein", "Low carb", "Vegetarian", "No preference"],
  },
  {
    key: "injuriesOrLimitations",
    label: "INJURIES_OR_LIMITATIONS",
    subtitle: "Any limitations we should account for?",
    kind: "text",
    placeholder: "Knee pain, shoulder issue, none...",
  },
  {
    key: "medicalConditions",
    label: "MEDICAL_CONDITIONS",
    subtitle: "Any medical context to consider?",
    kind: "text",
    placeholder: "Asthma, diabetes, none...",
  },
  {
    key: "preferredWorkoutType",
    label: "PREFERRED_WORKOUT_TYPE",
    subtitle: "Your favorite training style.",
    kind: "select",
    options: ["Gym", "Home", "Bodyweight", "Running", "Mixed"],
  },
  {
    key: "equipmentAccess",
    label: "EQUIPMENT_ACCESS",
    subtitle: "What equipment do you have?",
    kind: "select",
    options: ["Full gym", "Basic dumbbells", "Bodyweight only", "Mixed access"],
  },
  {
    key: "notes",
    label: "NOTES",
    subtitle: "Any extra context for personalization?",
    kind: "text",
    placeholder: "Anything else we should know...",
  },
];

export default function MainOnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState<UserOnboardingProfile>(EMPTY_ONBOARDING_PROFILE);
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]!;
  });

  const currentField = ONBOARDING_FIELDS[stepIndex]!;
  const isLastStep = stepIndex === ONBOARDING_FIELDS.length - 1;
  const progressLabel = `${stepIndex + 1}/${ONBOARDING_FIELDS.length}`;

  const canProceedCurrentStep = useMemo(() => {
    if (isSubmitting || isAnimating) {
      return false;
    }
    if (!currentField.required) {
      return true;
    }
    return form[currentField.key].trim().length > 0;
  }, [currentField, form, isAnimating, isSubmitting]);

  const cardTranslateX = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardRotate = useSharedValue(0);

  const cardSwapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTranslateX.value },
      { scale: cardScale.value },
      { rotateZ: `${cardRotate.value}deg` },
    ],
  }));

  const updateField = useCallback(
    (key: keyof UserOnboardingProfile, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const showRandomQuote = useCallback(() => {
    setQuote((prev) => {
      if (MOTIVATIONAL_QUOTES.length < 2) {
        return prev;
      }
      let next = prev;
      while (next === prev) {
        next = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]!;
      }
      return next;
    });
  }, []);

  const completeTransition = useCallback(
    (targetIndex: number, direction: 1 | -1) => {
      setStepIndex(targetIndex);
      showRandomQuote();

      cardTranslateX.value = direction * 24;
      cardScale.value = 0.985;
      cardRotate.value = direction * 0.8;

      cardTranslateX.value = withTiming(0, {
        duration: 420,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimating)(false);
        }
      });
      cardScale.value = withTiming(1, {
        duration: 420,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      cardRotate.value = withTiming(0, {
        duration: 420,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
    },
    [cardRotate, cardScale, cardTranslateX, showRandomQuote],
  );

  const animateStepChange = useCallback(
    (targetIndex: number, direction: 1 | -1) => {
      if (isAnimating) {
        return;
      }

      setIsAnimating(true);
      cardScale.value = withTiming(0.985, {
        duration: 220,
        easing: Easing.inOut(Easing.quad),
      });
      cardRotate.value = withTiming(-direction * 0.8, {
        duration: 220,
        easing: Easing.inOut(Easing.quad),
      });
      cardTranslateX.value = withTiming(
        -direction * 22,
        {
          duration: 220,
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(completeTransition)(targetIndex, direction);
          }
        },
      );
    },
    [cardRotate, cardScale, cardTranslateX, completeTransition, isAnimating],
  );

  const handleNext = useCallback(() => {
    if (!canProceedCurrentStep || isLastStep || isAnimating) {
      return;
    }
    setErrorMessage(null);
    animateStepChange(stepIndex + 1, 1);
  }, [animateStepChange, canProceedCurrentStep, isAnimating, isLastStep, stepIndex]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0 || isAnimating) {
      return;
    }
    setErrorMessage(null);
    animateStepChange(stepIndex - 1, -1);
  }, [animateStepChange, isAnimating, stepIndex]);

  const handleComplete = useCallback(async () => {
    if (!user?.id || !canProceedCurrentStep) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await saveMainOnboardingProfile(user.id, form);
      router.replace("/welcome" as Href);
    } catch {
      setErrorMessage("Unable to save onboarding data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceedCurrentStep, form, router, user?.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.hero}>
            <Text style={styles.phaseLabel}>MAIN ONBOARDING · {progressLabel}</Text>
            <GlowingText style={styles.headline}>
              {`${currentField.label}${currentField.required ? " *" : ""}`}
            </GlowingText>
            <Text style={styles.subtitle}>{currentField.subtitle}</Text>
          </View>

          <Animated.View style={[styles.formCard, cardSwapStyle]}>
            <View style={styles.form}>
            {currentField.kind === "text" ? (
              <AuthTextField
                label={currentField.label}
                placeholder={currentField.placeholder}
                keyboardType={currentField.keyboardType ?? "default"}
                value={form[currentField.key]}
                onChangeText={(v) => updateField(currentField.key, v)}
                editable={!isSubmitting}
              />
            ) : (
              <View style={styles.optionList}>
                {currentField.options.map((option) => {
                  const isSelected = form[currentField.key] === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => updateField(currentField.key, option)}
                      style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <View style={styles.actions}>
              <View style={styles.nextWrap}>
                <AuthPrimaryButton
                  label={
                    isLastStep
                      ? isSubmitting
                        ? "SAVING PROFILE..."
                        : "Complete Onboarding →"
                      : "Next →"
                  }
                  onPress={isLastStep ? handleComplete : handleNext}
                  disabled={!canProceedCurrentStep}
                />
              </View>

              <Pressable
                onPress={handleBack}
                disabled={stepIndex === 0 || isSubmitting || isAnimating}
                style={[
                  styles.backButton,
                  (stepIndex === 0 || isSubmitting || isAnimating) &&
                    styles.backButtonDisabled,
                ]}
              >
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            </View>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.quoteText}>"{quote}"</Text>
            <Pressable
              onPress={() => router.replace("/(tabs)" as Href)}
              disabled={isSubmitting || isAnimating}
              style={styles.skipWrap}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const mono = {
  fontFamily: appFonts.semiBold,
};

const body = {
  fontFamily: appFonts.regular,
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    justifyContent: "center",
    gap: 18,
  },
  hero: {
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    ...mono,
    color: onboardingTheme.accentMuted,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  headline: {
    fontSize: 33,
  },
  subtitle: {
    ...body,
    color: onboardingTheme.accentMuted,
    fontSize: 24,
    lineHeight: 30,
    textAlign: "center",
    maxWidth: 340,
  },
  form: {
    gap: 14,
  },
  formCard: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: onboardingTheme.radius,
    backgroundColor: onboardingTheme.surface,
    padding: 14,
  },
  errorText: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 11,
  },
  optionList: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: onboardingTheme.radius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: onboardingTheme.background,
  },
  optionButtonSelected: {
    borderColor: onboardingTheme.accent,
  },
  optionText: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentMuted,
    fontSize: 14,
  },
  optionTextSelected: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  backButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: onboardingTheme.radius,
    paddingVertical: 14,
    alignItems: "center",
  },
  backButtonDisabled: {
    opacity: 0.45,
  },
  backText: {
    ...mono,
    color: onboardingTheme.accent,
    fontSize: 12,
  },
  nextWrap: {
    width: "100%",
  },
  footer: {
    marginTop: 28,
    gap: 12,
    alignItems: "center",
  },
  quoteText: {
    ...body,
    color: onboardingTheme.accentDim,
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  skipWrap: {
    alignItems: "center",
  },
  skipText: {
    ...mono,
    color: onboardingTheme.accentDim,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
