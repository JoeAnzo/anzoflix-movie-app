import { useMutation,QueryClient } from "@tanstack/react-query";
import { signInWithEmailAndPassword,signUpWithEmailAndPassword,authenticateWithGoogle} from "../services/appwrite";
import type {LoginInput,SignUpInput} from '../schemas/auth.schema'


const queryClient = new QueryClient();


export const useSignInMutation = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async (credentials: LoginInput) => {
            await signInWithEmailAndPassword(credentials.email, credentials.password);
        },
        onSuccess: () => {
            console.log("Logged in successfully!");
            if (onSuccessCallback) onSuccessCallback();
        }
    })
}

export const useSignUpMutation = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async (credentials: SignUpInput) => {
            await signUpWithEmailAndPassword(credentials.email, credentials.password);
        },
        onSuccess: () => {
            console.log("Signed up successfully!");
            if (onSuccessCallback) onSuccessCallback();
        }
    })
}

export const useGoogleAuthMutation = (onSuccessCallback?: () => void) => {
    // Access the queryClient instance inside the hook framework safely
  
    return useMutation({
        mutationFn: authenticateWithGoogle,
        onSuccess: (data) => {
            // Force state refresh across the app by invalidating user queries
            queryClient.invalidateQueries({ queryKey: ["user"] });
            
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            // Safe message breakdown to prevent crashes on obscure network error shapes
            const errorMessage = error?.message || error || "An unexpected OAuth exception occurred.";
            console.error("Google Authentication Mutation Hook Error Context:", errorMessage);
        },
    });
};