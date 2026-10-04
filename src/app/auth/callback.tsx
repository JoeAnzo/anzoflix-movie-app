// app/auth/callback.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { account, syncCurrentUserProfile } from "../services/appwrite";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isCreatingSession = useRef(false); // Prevents React Double-Mounting in Development

  useEffect(() => {
    const { userId, secret } = params;

    if (userId && secret && !isCreatingSession.current) {
      isCreatingSession.current = true;

      const finalizeSession = async () => {
        try {
          // 1. Strictly AWAIT the backend session creation right here
          await account.createSession({
            userId: Array.isArray(userId) ? userId[0] : userId,
            secret: Array.isArray(secret) ? secret[0] : secret,
          });

          await syncCurrentUserProfile();

          // 2. ONLY navigate home after the line above finishes successfully
          router.replace("/(tabs)/home");
        } catch (error) {
          console.error("Synchronized Session Initialization Failed:", error);
          router.replace("/login"); // Fallback to login if session creation fails
        }
      };

      finalizeSession();
    } else if (!userId || !secret) {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="#E50914" />
      <Text style={{ color: "#fff", marginTop: 12, fontSize: 14 }}>
        Securing your account...
      </Text>
    </View>
  );
}
