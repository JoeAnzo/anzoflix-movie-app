import { Redirect } from "expo-router";
import { useApp } from "./context/AppContext";
import "./global.css";

// This is the app's landing route.
// Instead of always taking users to the sign-up screen, we redirect based on the real auth state.
export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/login"} />;
}
