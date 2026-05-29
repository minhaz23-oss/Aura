import { useUser } from "@clerk/clerk-expo";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { OnboardingChrome, SystemNotice } from "@/components/main-onboarding/OnboardingChrome";
import {
  SelectionCard,
  type SelectionIconName,
} from "@/components/main-onboarding/SelectionCard";
import { UnitToggle } from "@/components/main-onboarding/UnitToggle";
import { WheelPicker } from "@/components/main-onboarding/WheelPicker";
import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";
import {
  ageFromBirthDate,
  cmFromFeetInches,
  daysInMonth,
  kgFromLbs,
  type HeightUnit,
  type WeightUnit,
} from "@/lib/onboarding-units";
import {
  EMPTY_ONBOARDING_PROFILE,
  saveMainOnboardingProfile,
  type UserOnboardingProfile,
} from "@/lib/user-onboarding";

type FieldKey = keyof UserOnboardingProfile;

type SelectOption = {
  value: string;
  title: string;
  subtitle: string;
  icon: SelectionIconName;
};

type StepConfig = {
  id: string;
  phase: 1 | 2 | 3 | 4;
  kind: "height" | "weight" | "birthDate" | "text" | "select";
  key?: FieldKey;
  title: string;
  subtitle: string;
  noticeTitle: string;
  noticeMessage: string;
  required?: boolean;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  options?: SelectOption[];
  useWeightUnit?: boolean;
};

const TOTAL_PHASES = 4;

const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "username",
    phase: 1,
    kind: "text",
    key: "username",
    title: "Choose your hunter username.",
    subtitle: "This is how the system will identify you.",
    noticeTitle: "SYSTEM ASSESSMENT INITIATED",
    noticeMessage: "Hunter, register your call sign.",
    required: true,
    placeholder: "shadow_hunter",
    keyboardType: "default",
  },
  {
    id: "height",
    phase: 1,
    kind: "height",
    title: "State your height, Hunter.",
    subtitle: "The system needs your baseline measurements.",
    noticeTitle: "SYSTEM ASSESSMENT INITIATED",
    noticeMessage: "Hunter, provide your physical baseline.",
    required: true,
  },
  {
    id: "weight",
    phase: 1,
    kind: "weight",
    title: "State your weight, Hunter.",
    subtitle: "Choose your preferred unit and enter current weight.",
    noticeTitle: "BODY METRICS",
    noticeMessage: "Record your current mass for calibration.",
    required: true,
  },
  {
    id: "birthDate",
    phase: 1,
    kind: "birthDate",
    title: "When were you born, Hunter?",
    subtitle: "Your birth date helps personalize training intensity.",
    noticeTitle: "IDENTITY SYNC",
    noticeMessage: "Select year, month, and day.",
    required: true,
  },
  {
    id: "sleep",
    phase: 2,
    kind: "text",
    key: "sleepHours",
    title: "How many hours do you sleep?",
    subtitle: "Recovery is part of the awakening protocol.",
    noticeTitle: "RECOVERY PROTOCOL",
    noticeMessage: "Average nightly sleep duration.",
    required: true,
    placeholder: "7.5",
    keyboardType: "decimal-pad",
  },
  {
    id: "gender",
    phase: 2,
    kind: "select",
    key: "gender",
    title: "Select your gender.",
    subtitle: "Used only for plan personalization.",
    noticeTitle: "PROFILE DATA",
    noticeMessage: "Choose one option below.",
    options: [
      { value: "Male", title: "Male", subtitle: "Default hunter class", icon: "gender-male" },
      { value: "Female", title: "Female", subtitle: "Default hunter class", icon: "gender-female" },
      {
        value: "Other",
        title: "Other",
        subtitle: "Custom profile path",
        icon: "gender-non-binary",
      },
      {
        value: "Prefer not to say",
        title: "Prefer not to say",
        subtitle: "Skip classification",
        icon: "eye-off-outline",
      },
    ],
  },
  {
    id: "activity",
    phase: 2,
    kind: "select",
    key: "activityLevel",
    title: "How active are you currently?",
    subtitle: "Your current activity sets quest difficulty.",
    noticeTitle: "ACTIVITY SCAN",
    noticeMessage: "Select your current training level.",
    options: [
      { value: "Beginner", title: "Beginner", subtitle: "Low activity baseline", icon: "walk" },
      { value: "Moderate", title: "Moderate", subtitle: "Balanced output", icon: "run" },
      {
        value: "Advanced",
        title: "Advanced",
        subtitle: "High output hunter",
        icon: "lightning-bolt",
      },
    ],
  },
  {
    id: "goal",
    phase: 3,
    kind: "select",
    key: "primaryGoal",
    title: "What is your primary goal, Hunter?",
    subtitle: "Choose the objective that drives your journey.",
    noticeTitle: "OBJECTIVE LOCK",
    noticeMessage: "Hunter, state your objective.",
    required: true,
    options: [
      {
        value: "Muscle gain",
        title: "Build Muscle",
        subtitle: "Increase STR & VIT",
        icon: "dumbbell",
      },
      {
        value: "Fat loss",
        title: "Lose Fat",
        subtitle: "Optimize AGI & DEX",
        icon: "fire",
      },
      {
        value: "Endurance",
        title: "Boost Endurance",
        subtitle: "Raise END & VIT",
        icon: "run-fast",
      },
      {
        value: "General fitness",
        title: "General Fitness",
        subtitle: "Balanced stat growth",
        icon: "heart-pulse",
      },
      {
        value: "Habit building",
        title: "Build Habits",
        subtitle: "Consistency protocol",
        icon: "checkbox-marked-circle-outline",
      },
    ],
  },
  {
    id: "targetWeight",
    phase: 3,
    kind: "weight",
    key: "targetWeightKg",
    title: "Target weight (optional).",
    subtitle: "Set a target mass if you have one.",
    noticeTitle: "TARGET CALIBRATION",
    noticeMessage: "Optional future body weight.",
    useWeightUnit: true,
  },
  {
    id: "days",
    phase: 3,
    kind: "select",
    key: "workoutDaysPerWeek",
    title: "Training days per week?",
    subtitle: "How often will you enter the dungeon?",
    noticeTitle: "SCHEDULE",
    noticeMessage: "Weekly training frequency.",
    options: ["2", "3", "4", "5", "6+"].map((v) => ({
      value: v,
      title: `${v} days`,
      subtitle: "Weekly quest load",
      icon: "calendar" as SelectionIconName,
    })),
  },
  {
    id: "duration",
    phase: 3,
    kind: "select",
    key: "workoutDurationMinutes",
    title: "Session duration?",
    subtitle: "Preferred minutes per training session.",
    noticeTitle: "SESSION LENGTH",
    noticeMessage: "Pick your average workout time.",
    options: ["20", "30", "45", "60", "90"].map((v) => ({
      value: v,
      title: `${v} min`,
      subtitle: "Per session target",
      icon: "timer-outline" as SelectionIconName,
    })),
  },
  {
    id: "diet",
    phase: 4,
    kind: "select",
    key: "dietPreference",
    title: "Nutrition preference?",
    subtitle: "Fuel protocol for your hunter build.",
    noticeTitle: "FUEL PROTOCOL",
    noticeMessage: "Choose your diet style.",
    options: [
      {
        value: "Balanced",
        title: "Balanced",
        subtitle: "Standard macro split",
        icon: "scale-balance",
      },
      {
        value: "High protein",
        title: "High Protein",
        subtitle: "STR recovery focus",
        icon: "food-steak",
      },
      { value: "Low carb", title: "Low Carb", subtitle: "Fat burn priority", icon: "leaf" },
      { value: "Vegetarian", title: "Vegetarian", subtitle: "Plant-based path", icon: "sprout" },
      {
        value: "No preference",
        title: "No Preference",
        subtitle: "Flexible intake",
        icon: "circle-outline",
      },
    ],
  },
  {
    id: "injuries",
    phase: 4,
    kind: "text",
    key: "injuriesOrLimitations",
    title: "Any injuries or limitations?",
    subtitle: "Optional — helps avoid penalty zones.",
    noticeTitle: "RISK CHECK",
    noticeMessage: "List limitations or type none.",
    placeholder: "Knee pain, shoulder issue, none...",
  },
  {
    id: "medical",
    phase: 4,
    kind: "text",
    key: "medicalConditions",
    title: "Any medical conditions?",
    subtitle: "Optional context for safer programming.",
    noticeTitle: "MEDICAL CONTEXT",
    noticeMessage: "List conditions or type none.",
    placeholder: "Asthma, diabetes, none...",
  },
  {
    id: "workoutType",
    phase: 4,
    kind: "select",
    key: "preferredWorkoutType",
    title: "Preferred workout style?",
    subtitle: "Your favorite training environment.",
    noticeTitle: "TRAINING MODE",
    noticeMessage: "Select your preferred style.",
    options: [
      { value: "Gym", title: "Gym", subtitle: "Full equipment access", icon: "dumbbell" },
      { value: "Home", title: "Home", subtitle: "Indoor protocol", icon: "home-outline" },
      {
        value: "Bodyweight",
        title: "Bodyweight",
        subtitle: "No gear required",
        icon: "human-handsup",
      },
      { value: "Running", title: "Running", subtitle: "Cardio focused", icon: "run" },
      { value: "Mixed", title: "Mixed", subtitle: "Hybrid training", icon: "flash" },
    ],
  },
  {
    id: "equipment",
    phase: 4,
    kind: "select",
    key: "equipmentAccess",
    title: "Equipment access?",
    subtitle: "What tools do you have available?",
    noticeTitle: "LOADOUT",
    noticeMessage: "Select available equipment.",
    options: [
      { value: "Full gym", title: "Full Gym", subtitle: "Complete arsenal", icon: "warehouse" },
      {
        value: "Basic dumbbells",
        title: "Basic Dumbbells",
        subtitle: "Limited loadout",
        icon: "dumbbell",
      },
      {
        value: "Bodyweight only",
        title: "Bodyweight Only",
        subtitle: "Minimal gear",
        icon: "account-outline",
      },
      {
        value: "Mixed access",
        title: "Mixed Access",
        subtitle: "Variable setup",
        icon: "shape-outline",
      },
    ],
  },
  {
    id: "notes",
    phase: 4,
    kind: "text",
    key: "notes",
    title: "Anything else we should know?",
    subtitle: "Optional notes for deeper personalization.",
    noticeTitle: "FINAL INPUT",
    noticeMessage: "Add any extra context.",
    placeholder: "Anything else we should know...",
  },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, i) => String(CURRENT_YEAR - i));
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

function buildProfilePayload(form: UserOnboardingProfile): UserOnboardingProfile {
  const year = Number(form.birthYear);
  const month = Number(form.birthMonth);
  const day = Number(form.birthDay);

  let heightCm = form.heightCm;
  if (form.heightUnit === "ft_in") {
    heightCm = String(
      cmFromFeetInches(Number(form.heightFt) || 0, Number(form.heightIn) || 0),
    );
  }

  let weightKg = form.weightKg;
  if (form.weightUnit === "lbs" && form.weightLbs.trim()) {
    weightKg = String(kgFromLbs(Number(form.weightLbs) || 0));
  }

  let targetWeightKg = form.targetWeightKg;
  if (form.targetWeightKg.trim() && form.weightUnit === "lbs") {
    targetWeightKg = String(kgFromLbs(Number(form.targetWeightKg) || 0));
  }

  const age =
    year && month && day ? String(ageFromBirthDate(year, month, day)) : form.age;

  return {
    ...form,
    username: form.username.trim(),
    heightCm,
    weightKg,
    targetWeightKg,
    age,
  };
}

function isStepValid(step: StepConfig, form: UserOnboardingProfile) {
  if (step.kind === "height") {
    if (form.heightUnit === "cm") {
      return Number(form.heightCm) > 0;
    }
    const ft = Number(form.heightFt) || 0;
    const inches = Number(form.heightIn) || 0;
    return ft > 0 || inches > 0;
  }
  if (step.kind === "weight") {
    if (step.key === "targetWeightKg") {
      return true;
    }
    if (form.weightUnit === "kg") {
      return Number(form.weightKg) > 0;
    }
    return Number(form.weightLbs) > 0;
  }
  if (step.kind === "birthDate") {
    return Boolean(form.birthYear && form.birthMonth && form.birthDay);
  }
  if (step.key === "username") {
    return form.username.trim().length >= 2;
  }
  if (step.required && step.key) {
    return form[step.key].trim().length > 0;
  }
  return true;
}

export default function MainOnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState<UserOnboardingProfile>(EMPTY_ONBOARDING_PROFILE);
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentStep = ONBOARDING_STEPS[stepIndex]!;
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const dayOptions = useMemo(() => {
    const year = Number(form.birthYear) || CURRENT_YEAR;
    const month = Number(form.birthMonth) || 1;
    const maxDays = daysInMonth(year, month);
    return Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [form.birthYear, form.birthMonth]);

  useEffect(() => {
    if (currentStep.kind !== "birthDate") {
      return;
    }
    if (!form.birthYear || !form.birthMonth || !form.birthDay) {
      setForm((prev) => ({
        ...prev,
        birthYear: prev.birthYear || YEAR_OPTIONS[25]!,
        birthMonth: prev.birthMonth || "01",
        birthDay: prev.birthDay || "01",
      }));
    }
  }, [currentStep.kind, form.birthDay, form.birthMonth, form.birthYear]);

  useEffect(() => {
    if (!form.birthDay) {
      return;
    }
    const max = dayOptions.length;
    if (Number(form.birthDay) > max) {
      setForm((prev) => ({ ...prev, birthDay: String(max).padStart(2, "0") }));
    }
  }, [dayOptions.length, form.birthDay]);

  const canProceed = useMemo(() => {
    if (isSubmitting || isAnimating) {
      return false;
    }
    return isStepValid(currentStep, form);
  }, [currentStep, form, isAnimating, isSubmitting]);

  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  const updateField = useCallback((key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const completeTransition = useCallback(
    (targetIndex: number, direction: 1 | -1) => {
      setStepIndex(targetIndex);
      cardTranslateX.value = direction * 28;
      cardOpacity.value = 0.92;
      cardTranslateX.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) });
      cardOpacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(setIsAnimating)(false);
      });
    },
    [cardOpacity, cardTranslateX],
  );

  const animateStepChange = useCallback(
    (targetIndex: number, direction: 1 | -1) => {
      if (isAnimating) {
        return;
      }
      setIsAnimating(true);
      cardOpacity.value = withTiming(0.55, { duration: 180 }, (finished) => {
        if (finished) {
          runOnJS(completeTransition)(targetIndex, direction);
        }
      });
    },
    [cardOpacity, completeTransition, isAnimating],
  );

  const handleNext = useCallback(() => {
    if (!canProceed || isLastStep || isAnimating) {
      return;
    }
    setErrorMessage(null);
    animateStepChange(stepIndex + 1, 1);
  }, [animateStepChange, canProceed, isAnimating, isLastStep, stepIndex]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0 || isAnimating) {
      return;
    }
    setErrorMessage(null);
    animateStepChange(stepIndex - 1, -1);
  }, [animateStepChange, isAnimating, stepIndex]);

  const handleComplete = useCallback(async () => {
    if (!user?.id || !canProceed) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload = buildProfilePayload(form);
      await saveMainOnboardingProfile(user.id, payload);
      router.replace("/assessment" as Href);
    } catch {
      setErrorMessage("Unable to save onboarding data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceed, form, router, user?.id]);

  const renderHeightStep = () => (
    <View style={styles.inputBlock}>
      <UnitToggle<HeightUnit>
        left="cm"
        right="ft_in"
        leftLabel="CM"
        rightLabel="FT / IN"
        value={(form.heightUnit as HeightUnit) || "cm"}
        onChange={(unit) => updateField("heightUnit", unit)}
      />
      {form.heightUnit === "ft_in" ? (
        <View style={styles.splitRow}>
          <View style={styles.splitField}>
            <Text style={styles.fieldLabel}>FT</Text>
            <TextInput
              style={styles.valueInput}
              value={form.heightFt}
              onChangeText={(v) => updateField("heightFt", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={onboardingTheme.accentDim}
            />
          </View>
          <View style={styles.splitField}>
            <Text style={styles.fieldLabel}>IN</Text>
            <TextInput
              style={styles.valueInput}
              value={form.heightIn}
              onChangeText={(v) => updateField("heightIn", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={onboardingTheme.accentDim}
            />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.fieldLabel}>CENTIMETERS</Text>
          <TextInput
            style={styles.valueInput}
            value={form.heightCm}
            onChangeText={(v) => updateField("heightCm", v.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            placeholder="175"
            placeholderTextColor={onboardingTheme.accentDim}
          />
        </View>
      )}
    </View>
  );

  const renderWeightStep = (fieldKey: FieldKey = "weightKg") => (
    <View style={styles.inputBlock}>
      <UnitToggle<WeightUnit>
        left="kg"
        right="lbs"
        leftLabel="KG"
        rightLabel="LBS"
        value={(form.weightUnit as WeightUnit) || "kg"}
        onChange={(unit) => updateField("weightUnit", unit)}
      />
      {form.weightUnit === "lbs" ? (
        <View>
          <Text style={styles.fieldLabel}>POUNDS</Text>
          <TextInput
            style={styles.valueInput}
            value={fieldKey === "targetWeightKg" ? form.targetWeightKg : form.weightLbs}
            onChangeText={(v) =>
              updateField(fieldKey === "targetWeightKg" ? "targetWeightKg" : "weightLbs", v.replace(/[^0-9.]/g, ""))
            }
            keyboardType="decimal-pad"
            placeholder="154"
            placeholderTextColor={onboardingTheme.accentDim}
          />
        </View>
      ) : (
        <View>
          <Text style={styles.fieldLabel}>KILOGRAMS</Text>
          <TextInput
            style={styles.valueInput}
            value={fieldKey === "targetWeightKg" ? form.targetWeightKg : form.weightKg}
            onChangeText={(v) => updateField(fieldKey, v.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            placeholder="70"
            placeholderTextColor={onboardingTheme.accentDim}
          />
        </View>
      )}
    </View>
  );

  const renderBirthDateStep = () => (
    <View style={styles.dateRow}>
      <View style={styles.dateColumn}>
        <Text style={styles.fieldLabel}>YEAR</Text>
        <WheelPicker
          items={YEAR_OPTIONS}
          value={form.birthYear || YEAR_OPTIONS[25]!}
          onChange={(v) => updateField("birthYear", v)}
        />
      </View>
      <View style={styles.dateColumn}>
        <Text style={styles.fieldLabel}>MONTH</Text>
        <WheelPicker
          items={MONTH_OPTIONS}
          value={form.birthMonth || "01"}
          onChange={(v) => updateField("birthMonth", v)}
        />
      </View>
      <View style={styles.dateColumn}>
        <Text style={styles.fieldLabel}>DAY</Text>
        <WheelPicker
          items={dayOptions}
          value={form.birthDay || "01"}
          onChange={(v) => updateField("birthDay", v)}
        />
      </View>
    </View>
  );

  const renderStepBody = () => {
    if (currentStep.kind === "height") {
      return renderHeightStep();
    }
    if (currentStep.kind === "weight") {
      return renderWeightStep(currentStep.key ?? "weightKg");
    }
    if (currentStep.kind === "birthDate") {
      return renderBirthDateStep();
    }
    if (currentStep.kind === "text" && currentStep.key) {
      const isMultiline = currentStep.id === "injuries" || currentStep.id === "notes";
      return (
        <TextInput
          style={[styles.valueInput, isMultiline && styles.textArea]}
          value={form[currentStep.key]}
          onChangeText={(v) => updateField(currentStep.key!, v)}
          placeholder={currentStep.placeholder}
          placeholderTextColor={onboardingTheme.accentDim}
          keyboardType={currentStep.keyboardType ?? "default"}
          autoCapitalize={currentStep.id === "username" ? "none" : "sentences"}
          autoCorrect={currentStep.id !== "username"}
          multiline={isMultiline}
        />
      );
    }
    if (currentStep.kind === "select" && currentStep.options && currentStep.key) {
      return (
        <View style={styles.optionList}>
          {currentStep.options.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
              selected={form[currentStep.key!] === option.value}
              onPress={() => updateField(currentStep.key!, option.value)}
            />
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <OnboardingChrome
            phase={currentStep.phase}
            totalPhases={TOTAL_PHASES}
            canGoBack={stepIndex > 0}
            onBack={handleBack}
          />

          <SystemNotice
            title={currentStep.noticeTitle}
            message={currentStep.noticeMessage}
          />

          <Text style={styles.title}>{currentStep.title}</Text>

          <Animated.View style={cardStyle}>
            {renderStepBody()}
          </Animated.View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <AuthPrimaryButton
              label={
                isLastStep
                  ? isSubmitting
                    ? "SAVING PROFILE..."
                    : "Complete Assessment →"
                  : "Continue →"
              }
              onPress={isLastStep ? handleComplete : handleNext}
              disabled={!canProceed}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/assessment" as Href)}
            disabled={isSubmitting || isAnimating}
            style={styles.skipWrap}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingTheme.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  title: {
    fontFamily: appFonts.extraBold,
    color: onboardingTheme.accent,
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  inputBlock: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: "#0d0d0d",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 22,
    textAlign: "center",
  },
  textArea: {
    minHeight: 96,
    textAlign: "left",
    fontSize: 15,
    fontFamily: appFonts.regular,
  },
  splitRow: {
    flexDirection: "row",
    gap: 10,
  },
  splitField: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: onboardingTheme.line,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "#0d0d0d",
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  optionList: {
    gap: 10,
  },
  errorText: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accent,
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  actions: {
    marginTop: 24,
  },
  skipWrap: {
    marginTop: 16,
    alignItems: "center",
  },
  skipText: {
    fontFamily: appFonts.semiBold,
    color: onboardingTheme.accentDim,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
