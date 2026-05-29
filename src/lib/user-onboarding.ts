import { supabase } from "@/lib/supabase";

export type HunterAssessment = {
  rank: string;
  strength: number;
  agility: number;
  endurance: number;
  vitality: number;
  assessedAt: string;
};

export type UserOnboardingProfile = {
  username: string;
  heightCm: string;
  heightUnit: string;
  heightFt: string;
  heightIn: string;
  weightKg: string;
  weightUnit: string;
  weightLbs: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
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
  assessment?: HunterAssessment;
};

export const EMPTY_ONBOARDING_PROFILE: UserOnboardingProfile = {
  username: "",
  heightCm: "",
  heightUnit: "cm",
  heightFt: "",
  heightIn: "",
  weightKg: "",
  weightUnit: "kg",
  weightLbs: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
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

export async function saveHunterAssessment(userId: string, assessment: HunterAssessment) {
  const existing = (await getMainOnboardingProfile(userId)) ?? { ...EMPTY_ONBOARDING_PROFILE };
  const merged: UserOnboardingProfile = {
    ...existing,
    assessment,
  };

  const { error } = await supabase.from(TABLE).upsert(
    {
      clerk_user_id: userId,
      onboarding_data: merged,
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

  inMemoryProfiles[userId] = merged;
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
