import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContextProvider, useApp } from "./context/AppContext";

// This component waits for the auth bootstrap to finish before rendering the real app tree.
// Without this guard, the app can flash protected screens before it knows the session state.
function AppShell() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#141414]">
        <ActivityIndicator
          size="large"
          color="#E50914"
          className="text-[#E50914] scale-150"
        />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
