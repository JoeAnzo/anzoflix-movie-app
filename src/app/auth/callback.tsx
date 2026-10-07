import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { account, syncCurrentUserProfile } from "../services/appwrite";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isCreatingSession = useRef(false);

  useEffect(() => {
    const { userId, secret } = params;

    if (userId && secret && !isCreatingSession.current) {
      isCreatingSession.current = true;

      const finalizeSession = async () => {
        try {
          // 1. Establish the session
          await account.createSession({
            userId: Array.isArray(userId) ? userId[0] : userId,
            secret: Array.isArray(secret) ? secret[0] : secret,
          });

          // 2. Short non-blocking pause to allow Appwrite client memory to bootstrap the session state
          await new Promise((resolve) => setTimeout(resolve, 800));

          // 3. Sync profile safely
          await syncCurrentUserProfile();

          // 4. Clean navigation away from callback route
          router.replace("/(tabs)/home");
        } catch (error) {
          console.error("Synchronized Session Initialization Failed:", error);
          router.replace("/login");
        }
      };

      finalizeSession();
    } else if (!userId || !secret) {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#141414" }}>
      <ActivityIndicator size="large" color="#E50914" />
    </View>
  );
}
