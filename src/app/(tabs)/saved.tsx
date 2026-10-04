import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../components/Logo";
import Search from "../components/Search";
import "../global.css";
import {
  getSavedMedia,
  removeSavedMovie,
  saveMovieToDatabase,
  type MediaRecordType,
} from "../services/appwrite";

interface SavedItem {
  $id: string;
  tmdb_id: string;
  movie_title?: string;
  movie_poster: string;
  media_type: MediaRecordType;
}

const savedMediaQueryKey = ["saved-media"] as const;

const SavedMediaCard = ({
  item,
  onDelete,
}: {
  item: SavedItem;
  onDelete?: (item: SavedItem) => void;
}) => {
  const router = useRouter();

  if (!item.movie_poster) {
    return null;
  }

  const handlePress = () => {
    router.push({
      pathname: "/details/[id]",
      params: {
        id: item.tmdb_id,
        mediaType: item.media_type,
      },
    });
  };

  const handleDelete = async () => {
    try {
      await removeSavedMovie(item.tmdb_id, item.media_type);
      onDelete?.(item);
    } catch (error) {
      console.error("Delete saved item failed:", error);
    }
  };

  return (
    <View style={{ width: 110 }} className="mr-3 mb-5">
      <Pressable onPress={handlePress}>
        <Image
          source={{ uri: item.movie_poster }}
          className="h-[160px] w-[110px] rounded-md bg-zinc-800"
          resizeMode="cover"
        />
      </Pressable>

      <View className="mt-2 flex-row items-center">
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-medium text-white" numberOfLines={2}>
            {item.movie_title || "Untitled"}
          </Text>
          <Text className="mt-1 text-[10px] uppercase text-zinc-400">
            {item.media_type === "movie" ? "Movie" : "TV Show"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.movie_title || "title"} from saved`}
          className="ml-1 h-8 w-8 items-center justify-center rounded-full bg-zinc-800"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#f87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SavedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(0));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    data: savedItems = [],
    isPending,
    refetch,
  } = useQuery<SavedItem[]>({
    queryKey: savedMediaQueryKey,
    queryFn: async () => (await getSavedMedia()) as unknown as SavedItem[],
    staleTime: 60_000,
    enabled: false,
  });

  const showToast = (message: string, action?: () => void) => {
    setToastMessage(message);
    setToastAction(() => action ?? null);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
        setToastAction(null);
      });
    }, 3500);
  };

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const handleDeleteSavedItem = (item: SavedItem) => {
    queryClient.setQueryData<SavedItem[]>(savedMediaQueryKey, (current = []) =>
      current.filter((entry) => entry.$id !== item.$id),
    );

    const undoAction = async () => {
      try {
        const restoredItem = await saveMovieToDatabase(
          item.tmdb_id,
          item.movie_poster,
          item.media_type,
          item.movie_title,
        );

        queryClient.setQueryData<SavedItem[]>(
          savedMediaQueryKey,
          (current = []) => [restoredItem as unknown as SavedItem, ...current],
        );
      } catch (error) {
        console.error("Undo save failed:", error);
      }
    };

    showToast("Removed from saved", undoAction);
  };

  const renderMediaSection = (title: string, items: SavedItem[]) => (
    <View className="mb-6">
      <Text className="mb-3 text-xl font-bold text-white">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-zinc-400">
          No saved {title.toLowerCase()} yet.
        </Text>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {items.map((item) => (
            <SavedMediaCard
              key={item.$id}
              item={item}
              onDelete={handleDeleteSavedItem}
            />
          ))}
        </View>
      )}
    </View>
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Loading saved titles...</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="p-2">
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Logo />
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="person-circle-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
        <Search />
      </View>
      <ScrollView
        className="flex-1 bg-black px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-3xl font-bold text-white">Saved</Text>
        {toastMessage && (
          <Animated.View
            pointerEvents="box-none"
            style={{
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            }}
            className="absolute left-4 right-4 top-4 z-50 rounded-full bg-white/10 px-4 py-3"
          >
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium text-white">
                {toastMessage}
              </Text>
              {toastAction && (
                <TouchableOpacity
                  onPress={() => {
                    toastAction();
                    setToastMessage(null);
                    setToastAction(null);
                    Animated.timing(toastAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }).start();
                  }}
                  className="rounded-full bg-white/15 px-3 py-1.5"
                >
                  <Text className="text-xs font-bold text-white">Undo</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {renderMediaSection(
          "Movies",
          savedItems.filter((item) => item.media_type === "movie"),
        )}
        {renderMediaSection(
          "TV Shows",
          savedItems.filter((item) => item.media_type === "tv"),
        )}
      </ScrollView>
    </View>
  );
}
