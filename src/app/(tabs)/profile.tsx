import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import "../global.css";
import { getUserProfile } from "../services/appwrite";
import ProfileRow from "../components/ProfileRow";

type ProfileData = {
  username?: string;
  email?: string;
  avatar_url?: string;
};




function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 ml-1 text-xs font-bold uppercase tracking-[2px] text-white">
      {children}
    </Text>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, selectedLanguage, setSelectedLanguage } = useApp();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        setIsLoading(true);
        const result = await getUserProfile();
        if (isActive) {
          setProfile(result as ProfileData | null);
          setIsLoading(false);
        }
      };

      void loadProfile();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const displayName =
    profile?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Movie fan";
  const email = profile?.email || user?.email || "Your account";
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const languageLabel =
    selectedLanguage === "es-ES"
      ? "Español"
      : selectedLanguage === "fr-FR"
        ? "Français"
        : "English";

  const selectLanguage = () => {
    Alert.alert("App language", "Choose the language used for movie details.", [
      { text: "English", onPress: () => setSelectedLanguage("en-US") },
      { text: "Español", onPress: () => setSelectedLanguage("es-ES") },
      { text: "Français", onPress: () => setSelectedLanguage("fr-FR") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showAccountDetails = () => {
    Alert.alert("Account details", `${displayName}\n${email}`);
  };

  const showAbout = () => {
    Alert.alert(
      "About AnzoFlix",
      "AnzoFlix helps you discover movies and TV shows and keep track of what you want to watch. Movie and TV information is provided by TMDB.",
    );
  };

  const contactSupport = () => {
    Alert.alert(
      "Help & support",
      "Support contact details have not been configured yet. Please check back soon.",
    );
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void logout().then(() => router.replace("/(auth)/login"));
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView
        className="flex-1 bg-[#09090b]"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-7 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-bold uppercase tracking-[3px] text-red-500">
              AnzoFlix
            </Text>
            <Text className="mt-1 text-3xl font-extrabold text-white">
              Profile
            </Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Ionicons name="settings-outline" size={20} color="white" />
          </View>
        </View>

        <View className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] p-5">
          <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-red-600/10" />
          <View className="flex-row items-center">
            <View className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-2 border-red-500/70 bg-zinc-800">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-2xl font-bold text-white">
                  {initials || "M"}
                </Text>
              )}
            </View>
            <View className="ml-4 flex-1">
              {isLoading ? (
                <ActivityIndicator color="#E50914" />
              ) : (
                <>
                  <Text
                    className="text-xl font-bold text-white"
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <Text
                    className="mt-1 text-sm text-zinc-400"
                    numberOfLines={1}
                  >
                    {email}
                  </Text>
                </>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View account details"
              onPress={showAccountDetails}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/5"
            >
              <Ionicons name="create-outline" size={18} color="#d4d4d8" />
            </Pressable>
          </View>
          <View className="my-5 h-px bg-white/10" />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/saved")}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="bookmark" size={17} color="#ef4444" />
              <Text className="ml-2 text-sm font-semibold text-zinc-200">
                Your saved titles
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#a1a1aa" />
          </Pressable>
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
          <ProfileRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Notification preference on this device"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#3f3f46", true: "#991b1b" }}
                thumbColor={notificationsEnabled ? "#ef4444" : "#d4d4d8"}
                accessibilityLabel="Toggle notifications"
              />
            }
          />
          <View className="ml-[68px] h-px bg-white/5" />
          <ProfileRow
            icon="language-outline"
            title="App language"
            subtitle={languageLabel}
            onPress={selectLanguage}
          />
        </View>

        <SectionLabel>Support & about</SectionLabel>
        <View className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
          <ProfileRow
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Get help with your account"
            onPress={() => void contactSupport()}
          />
          <View className="ml-[68px] h-px bg-white/5" />
          <ProfileRow
            icon="information-circle-outline"
            title="About AnzoFlix"
            subtitle="Version 1.0 · Powered by TMDB"
            onPress={showAbout}
          />
          <View className="ml-[68px] h-px bg-white/5" />
          <ProfileRow
            icon="shield-checkmark-outline"
            title="Privacy & data"
            subtitle="Learn how your account data is used"
            onPress={() =>
              Alert.alert(
                "Privacy & data",
                "Your account profile and saved titles are stored in your MovieBox account. Contact support if you need help with your data.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Contact support",
                    onPress: () => void contactSupport(),
                  },
                ],
              )
            }
          />
        </View>

        <View className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
          <ProfileRow
            icon="log-out-outline"
            title="Sign out"
            subtitle="Sign out of this device"
            onPress={confirmSignOut}
            destructive
          />
        </View>
        <Text className="mt-6 text-center text-xs text-zinc-600">
          Made for movie nights
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
