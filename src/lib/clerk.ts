type ClerkErrorShape = {
  errors?: Array<{
    longMessage?: string;
    message?: string;
  }>;
  message?: string;
};

export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing Clerk publishable key. Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local.",
  );
}

export function getClerkErrorMessage(
  error: unknown,
  fallbackMessage = "Authentication failed. Please try again.",
) {
  if (typeof error !== "object" || error === null) {
    return fallbackMessage;
  }

  const typedError = error as ClerkErrorShape;
  const firstError = typedError.errors?.[0];

  if (firstError?.longMessage) {
    return firstError.longMessage;
  }

  if (firstError?.message) {
    return firstError.message;
  }

  if (typedError.message) {
    return typedError.message;
  }

  return fallbackMessage;
}
