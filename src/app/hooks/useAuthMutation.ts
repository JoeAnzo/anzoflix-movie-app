import { useMutation } from "@tanstack/react-query";
import { useApp } from "../context/AppContext";
import { normalizeAuthError } from "../helpers/AuthErrorNormalizer";
import type { LoginInput, SignUpInput } from "../schemas/auth.schema";
import {
    authenticateWithGoogle,
    getCurrentUser,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
} from "../services/appwrite";

// This hook is now responsible for updating app-level auth state after a successful mutation.
// That is what keeps the UI in sync with Appwrite's real session status.
export const useSignInMutation = (onSuccessCallback?: () => void) => {
  const { setUser, setIsAuthenticated } = useApp();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      await signInWithEmailAndPassword(credentials.email, credentials.password);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));

      return currentUser;
    },
    onSuccess: () => {
      console.log("Logged in successfully!");
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useSignUpMutation = (onSuccessCallback?: () => void) => {
  const { setUser, setIsAuthenticated } = useApp();

  return useMutation({
    mutationFn: async (credentials: SignUpInput) => {
      await signUpWithEmailAndPassword(credentials.email, credentials.password);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));

      return currentUser;
    },
    onSuccess: () => {
      console.log("Signed up successfully!");
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useGoogleAuthMutation = (onSuccessCallback?: () => void) => {
  const { setUser, setIsAuthenticated } = useApp();

  return useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      // We log the normalized error for debugging but keep the UI output safe.
      const safeMessage = normalizeAuthError(error);
      console.error(
        "Google Authentication Mutation Hook Error Context:",
        safeMessage,
      );
    },
  });
};
