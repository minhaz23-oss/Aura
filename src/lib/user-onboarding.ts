import { supabase } from "@/lib/supabase";

export type UserOnboardingProfile = {
  heightCm: string;
  weightKg: string;
  sleepHours: string;
  age: string;
  gender: string;
  activityLevel: string;
  primaryGoal: string;
  targetWeightKg: string;
  workoutDaysPerWeek: string;
  workoutDurationMinutes: string;
  dietPreference: string;
  injuriesOrLimitations: string;
  medicalConditions: string;
  preferredWorkoutType: string;
  equipmentAccess: string;
  notes: string;
};

export const EMPTY_ONBOARDING_PROFILE: UserOnboardingProfile = {
  heightCm: "",
  weightKg: "",
  sleepHours: "",
  age: "",
  gender: "",
  activityLevel: "",
  primaryGoal: "",
  targetWeightKg: "",
  workoutDaysPerWeek: "",
  workoutDurationMinutes: "",
  dietPreference: "",
  injuriesOrLimitations: "",
  medicalConditions: "",
  preferredWorkoutType: "",
  equipmentAccess: "",
  notes: "",
};

const inMemoryProfiles: Record<string, UserOnboardingProfile> = {};
const inMemoryCompletion: Record<string, boolean> = {};
const TABLE = "clerk_onboarding_profiles";

type OnboardingRow = {
  clerk_user_id: string;
  is_onboarding_complete: boolean;
  onboarding_data: UserOnboardingProfile | null;
};

async function ensureMainOnboardingRow(userId: string) {
  const { error } = await supabase.from(TABLE).upsert(
    {
      clerk_user_id: userId,
      is_onboarding_complete: false,
    },
    {
      onConflict: "clerk_user_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function isMainOnboardingComplete(userId: string) {
  if (inMemoryCompletion[userId] !== undefined) {
    return inMemoryCompletion[userId];
  }

  await ensureMainOnboardingRow(userId);

  const { data, error } = await supabase
    .from(TABLE)
    .select("is_onboarding_complete")
    .eq("clerk_user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const done = Boolean(data?.is_onboarding_complete);
  inMemoryCompletion[userId] = done;
  return done;
}

export async function saveMainOnboardingProfile(
  userId: string,
  profile: UserOnboardingProfile,
) {
  const { error } = await supabase.from(TABLE).upsert(
    {
      clerk_user_id: userId,
      onboarding_data: profile,
      is_onboarding_complete: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "clerk_user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  inMemoryProfiles[userId] = profile;
  inMemoryCompletion[userId] = true;
}

export async function getMainOnboardingProfile(userId: string) {
  if (inMemoryProfiles[userId]) {
    return inMemoryProfiles[userId];
  }

  await ensureMainOnboardingRow(userId);

  const { data, error } = await supabase
    .from(TABLE)
    .select("clerk_user_id,is_onboarding_complete,onboarding_data")
    .eq("clerk_user_id", userId)
    .single<OnboardingRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.onboarding_data) {
    return null;
  }

  inMemoryCompletion[userId] = Boolean(data.is_onboarding_complete);
  inMemoryProfiles[userId] = data.onboarding_data;
  return data.onboarding_data;
}
