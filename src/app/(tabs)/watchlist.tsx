import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
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
    addMovieToWatchlist,
    getWatchlistMedia,
    removeMovieFromWatchlist,
    type MediaRecordType,
} from "../services/appwrite";

interface WatchlistItem {
  $id: string;
  tmdb_id: string;
  movie_title?: string;
  movie_poster: string;
  media_type: MediaRecordType;
}

const watchlistQueryKey = ["watchlist-media"] as const;

function WatchlistCard({
  item,
  onDelete,
}: {
  item: WatchlistItem;
  onDelete: (item: WatchlistItem) => void;
}) {
  const router = useRouter();

  if (!item.movie_poster) {
    return null;
  }

  return (
    <View style={{ width: 110 }} className="mr-3 mb-5">
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/details/[id]",
            params: { id: item.tmdb_id, mediaType: item.media_type },
          })
        }
      >
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
          onPress={() => onDelete(item)}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.movie_title || "title"} from watchlist`}
          className="ml-1 h-8 w-8 items-center justify-center rounded-full bg-zinc-800"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#f87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WatchlistScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(0));
  const [headerHeight, setHeaderHeight] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    data: watchlistItems = [],
    isPending,
    refetch,
  } = useQuery<WatchlistItem[]>({
    queryKey: watchlistQueryKey,
    queryFn: async () =>
      (await getWatchlistMedia()) as unknown as WatchlistItem[],
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

  const handleDelete = async (item: WatchlistItem) => {
    try {
      await removeMovieFromWatchlist(item.tmdb_id, item.media_type);
      queryClient.setQueryData<WatchlistItem[]>(
        watchlistQueryKey,
        (current = []) => current.filter((entry) => entry.$id !== item.$id),
      );

      const undoAction = async () => {
        try {
          const restoredItem = await addMovieToWatchlist(
            item.tmdb_id,
            item.movie_poster,
            item.media_type,
            item.movie_title,
          );
          queryClient.setQueryData<WatchlistItem[]>(
            watchlistQueryKey,
            (current = []) => [
              restoredItem as unknown as WatchlistItem,
              ...current,
            ],
          );
        } catch (error) {
          console.error("Undo watchlist removal failed:", error);
        }
      };

      showToast("Removed from watchlist", undoAction);
    } catch (error) {
      console.error("Remove watchlist item failed:", error);
    }
  };

  const renderSection = (title: string, items: WatchlistItem[]) => (
    <View className="mb-6">
      <Text className="mb-3 text-xl font-bold text-white">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-zinc-400">
          No {title.toLowerCase()} in your watchlist yet.
        </Text>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {items.map((item) => (
            <WatchlistCard key={item.$id} item={item} onDelete={handleDelete} />
          ))}
        </View>
      )}
    </View>
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-[#141414]">
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#141414]" style={{ position: "relative" }}>
      <View
        className="bg-[#141414] p-2"
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Logo />
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
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
        className="flex-1 bg-[#141414] px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-3xl font-bold text-white">Watchlist</Text>
        {renderSection(
          "Movies",
          watchlistItems.filter((item) => item.media_type === "movie"),
        )}
        {renderSection(
          "TV Shows",
          watchlistItems.filter((item) => item.media_type === "tv"),
        )}
      </ScrollView>
      {toastMessage && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: headerHeight + 4,
            zIndex: 100,
            elevation: 30,
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-48, 0],
                }),
              },
            ],
          }}
          className="rounded-md border border-zinc-500 bg-zinc-700 px-4 py-3"
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
    </View>
  );
}
