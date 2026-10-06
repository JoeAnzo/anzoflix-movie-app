import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import MoviePlayer from "../components/MoviePlayer";
import { resolvePlaybackSource, type MediaType } from "../services/api";

const isMediaType = (value: string | undefined): value is MediaType =>
  value === "movie" || value === "tv";

export default function WatchScreen() {
  const router = useRouter();
  const {
    id,
    mediaType: rawMediaType,
    title: rawTitle,
  } = useLocalSearchParams<{
    id: string;
    mediaType?: string;
    title?: string;
  }>();
  const mediaType = isMediaType(rawMediaType) ? rawMediaType : null;
  const title = Array.isArray(rawTitle) ? rawTitle[0] : rawTitle;
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadSource = async () => {
      setIsLoading(true);
      setError(null);
      setSourceUrl(null);

      if (!id || !/^\d+$/.test(id) || !mediaType) {
        setError("This playback link is invalid.");
        setIsLoading(false);
        return;
      }

      try {
        const resolvedUrl = await resolvePlaybackSource(mediaType, id);
        if (isActive) setSourceUrl(resolvedUrl);
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not find a playback source.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadSource();
    return () => {
      isActive = false;
    };
  }, [id, mediaType]);

  return (
    <View className="flex-1 bg-[#141414]">
      <View className="flex-row items-center gap-4 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="rounded-full bg-zinc-800 p-2"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-white" numberOfLines={1}>
          {title || "Watch"}
        </Text>
      </View>

      {sourceUrl ? (
        <MoviePlayer sourceUrl={sourceUrl} />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#E50914" />
              <Text className="mt-4 text-center text-zinc-300">
                Checking authorized playback sources…
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="film-outline" size={44} color="#a1a1aa" />
              <Text className="mt-4 text-center text-lg font-bold text-white">
                {error ? "Playback unavailable" : "No source available"}
              </Text>
              <Text className="mt-2 text-center leading-6 text-zinc-400">
                {error ||
                  "No authorized provider currently has this title available."}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}
