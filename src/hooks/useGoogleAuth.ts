import { useSSO } from "@clerk/clerk-expo";
import { type Href, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";

import { getClerkErrorMessage } from "@/lib/clerk";

type GoogleAuthResult =
  | { success: true }
  | { success: false; cancelled?: boolean; error?: string };

export function useGoogleAuth() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    setIsGoogleLoading(true);

    try {
      const redirectUrl = Linking.createURL("/sso-callback");
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)" as Href);
        return { success: true };
      }

      return { success: false, cancelled: true };
    } catch (error) {
      return {
        success: false,
        error: getClerkErrorMessage(
          error,
          "Google sign in failed. Enable Google OAuth in the Clerk Dashboard.",
        ),
      };
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router, startSSOFlow]);

  return { signInWithGoogle, isGoogleLoading };
}
