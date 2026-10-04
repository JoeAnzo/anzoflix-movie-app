import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CardSection from "../components/CardSection";
import Logo from "../components/Logo";
import Search from "../components/Search";
import VideoPlayer from "../components/videoPlayer";
import { useContent } from "../hooks/useContent";
import {
  fetchMovieDetails,
  fetchSimilarMovies,
  fetchSimilarTvs,
  fetchTvDetails,
} from "../services/api";
import {
  isMovieOnWatchlist,
  isMovieSaved,
  toggleMovieWatchlist,
  toggleSaveMovie,
} from "../services/appwrite";
import { formatRuntime } from "../utils/utils";

const DetailsScreen = () => {
  const router = useRouter();
  const { id, mediaType } = useLocalSearchParams<{
    id: string;
    mediaType: "movie" | "tv";
  }>();
  const { width: screenWidth } = Dimensions.get("window");
  const [isSaved, setIsSaved] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(0));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    data: details,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useContent(["details", mediaType, id], () =>
    mediaType === "movie"
      ? fetchMovieDetails(Number(id))
      : fetchTvDetails(Number(id)),
  );

  const {
    data: similar,
    isLoading: isLoadingSimilar,
    error: similarError,
  } = useContent(["similar", mediaType, id], () =>
    mediaType === "movie"
      ? fetchSimilarMovies(Number(id))
      : fetchSimilarTvs(Number(id)),
  );

  const isMovie = mediaType === "movie";
  const cast = details?.credits?.cast ?? [];
  const trailer =
    details?.videos?.results?.find(
      (video: { type?: string; site?: string; key?: string }) =>
        video.type === "Trailer" && video.site === "YouTube" && video.key,
    ) ?? null;

  const posterUrl = `https://image.tmdb.org/t/p/w500/${details?.poster_path}`;

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();

    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => setToastMessage(null));
    }, 1800);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!id || !mediaType) {
        return;
      }

      const [saved, watchlisted] = await Promise.all([
        isMovieSaved(String(id), mediaType),
        isMovieOnWatchlist(String(id), mediaType),
      ]);

      setIsSaved(saved);
      setIsOnWatchlist(watchlisted);
    };

    void fetchStatus();
  }, [id, mediaType]);

  const handleSavePress = async () => {
    try {
      if (!id || !mediaType) {
        return;
      }

      const nextSavedState = await toggleSaveMovie(
        String(id),
        posterUrl,
        mediaType,
        details?.title ?? details?.name ?? "Untitled",
      );
      setIsSaved(nextSavedState);
      showToast(
        nextSavedState ? "Saved to your library" : "Removed from saved",
      );
    } catch (error) {
      console.error("Save action failed:", error);
      Alert.alert("Unable to save this title right now.");
    }
  };

  const handleWatchlistPress = async () => {
    try {
      if (!id || !mediaType) {
        return;
      }

      const nextWatchlistState = await toggleMovieWatchlist(
        String(id),
        posterUrl,
        mediaType,
        details?.title ?? details?.name ?? "Untitled",
      );
      setIsOnWatchlist(nextWatchlistState);
      showToast(
        nextWatchlistState ? "Added to watchlist" : "Removed from watchlist",
      );
    } catch (error) {
      console.error("Watchlist action failed:", error);
      Alert.alert("Unable to update your watchlist right now.");
    }
  };

  if (isLoadingDetails || isLoadingSimilar) {
    return (
      <View className="p-2 flex-1 bg-black gap-2">
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="h-[560px] w-full overflow-hidden rounded-md bg-zinc-900">
            <Animated.View
              className="absolute inset-0 bg-zinc-800"
              style={{ opacity: 0.65 }}
            />
            <View className="absolute bottom-6 left-4 right-4">
              <View className="mb-4 flex-row gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View key={index} className="items-center">
                    <View className="h-8 w-8 rounded-full bg-zinc-700" />
                    <View className="mt-2 h-3 w-14 rounded bg-zinc-700" />
                  </Animated.View>
                ))}
              </View>
              <Animated.View
                className="h-9 w-3/4 rounded bg-zinc-700"
                style={{ opacity: 0.65 }}
              />
              <Animated.View
                className="mt-3 h-5 w-2/3 rounded bg-zinc-700"
                style={{ opacity: 0.65 }}
              />
              <Animated.View
                className="mt-3 h-5 w-1/2 rounded bg-zinc-700"
                style={{ opacity: 0.65 }}
              />
              <Animated.View
                className="mt-4 h-20 w-full rounded bg-zinc-700"
                style={{ opacity: 0.65 }}
              />
            </View>
          </View>
          <View className="mt-4 flex-row">
            {Array.from({ length: 5 }).map((_, index) => (
              <Animated.View
                key={index}
                className="mr-4 rounded-full bg-zinc-800"
                style={{ width: 82, height: 82, opacity: 0.65 }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (detailsError || !details || similarError || !similar) {
    return (
      <View className="flex-1 justify-center items-center bg-[#] p-4">
        <Text className="text-xl text-center">Something went wrong.</Text>
        <Text className="text-sm text-center">
          It seems we are having
          <br />
          some connectivity problems
          <br />
          Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => console.log("refresh")}
          activeOpacity={0.7}
          className="rounded-md bg-[#E50914]"
        >
          TRY AGAIN
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="p-2 flex-1 bg-black gap-2">
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
      <View className="relative flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={{ uri: posterUrl }}
            style={{ width: screenWidth, height: 560 }}
            className="overflow-hidden rounded-md"
            imageStyle={{ opacity: 0.92 }}
          >
            <View className="absolute inset-0 bg-black/25" />

            <View className="absolute bottom-0 left-0 right-0 bg-black/75 px-4 pb-5 pt-10">
              <View className="mb-4 flex-row gap-6">
                <TouchableOpacity
                  className="items-center"
                  onPress={handleSavePress}
                  accessibilityLabel={
                    isSaved ? "Remove from saved" : "Save movie"
                  }
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={27}
                    color="white"
                  />
                  <Text className="mt-1 text-xs font-semibold text-white">
                    {isSaved ? "Saved" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center"
                  onPress={handleWatchlistPress}
                  accessibilityLabel={
                    isOnWatchlist ? "Remove from watchlist" : "Add to watchlist"
                  }
                >
                  <Ionicons
                    name={
                      isOnWatchlist ? "checkmark-circle" : "add-circle-outline"
                    }
                    size={27}
                    color="white"
                  />
                  <Text className="mt-1 text-xs font-semibold text-white">
                    {isOnWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/watch/[id]",
                      params: {
                        id,
                        mediaType,
                        title: isMovie ? details.title : details.name,
                      },
                    })
                  }
                  accessibilityLabel="Watch this title"
                >
                  <Ionicons
                    name="play-circle-outline"
                    size={27}
                    color="white"
                  />
                  <Text className="mt-1 text-xs font-semibold text-white">
                    Watch
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-3xl font-bold text-white">
                {isMovie ? details.title : details.name}
              </Text>
              <Text className="mt-2 text-sm font-semibold text-zinc-200">
                {formatRuntime(details.runtime)} •{" "}
                {details.genres
                  ?.map((g: { name: string }) => g.name)
                  .join(", ")}
              </Text>
              {!isMovie && (
                <Text className="mt-1 text-sm font-semibold text-zinc-200">
                  {details.number_of_seasons} seasons •{" "}
                  {details.number_of_episodes} episodes
                </Text>
              )}
              <Text className="mt-4 text-base font-bold text-white">
                Overview
              </Text>
              <Text
                className="mt-1 text-sm leading-5 text-zinc-100"
                numberOfLines={5}
              >
                {details.overview || "No overview available."}
              </Text>
            </View>
          </ImageBackground>

          {trailer && (
            <View className="mt-4">
              <Text className="text-white text-xl font-bold mb-3">Trailer</Text>
              <VideoPlayer videoId={trailer.key} />
            </View>
          )}

          {cast.length > 0 && (
            <View className="mt-5">
              <Text className="text-white text-xl font-bold mb-3">Cast</Text>
              <FlatList
                data={cast.slice(0, 10)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `${item.id ?? item.name ?? "cast"}-${index}`
                }
                renderItem={({ item }) => {
                  const profileUrl = item.profile_path
                    ? `https://image.tmdb.org/t/p/w185/${item.profile_path}`
                    : null;

                  return (
                    <View className="mr-4 items-center" style={{ width: 90 }}>
                      {profileUrl ? (
                        <Image
                          source={{ uri: profileUrl }}
                          className="w-[80px] h-[80px] rounded-full bg-zinc-800"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-[80px] h-[80px] rounded-full bg-zinc-800 items-center justify-center">
                          <Text className="text-zinc-400 text-[10px]">N/A</Text>
                        </View>
                      )}
                      <Text
                        className="text-white text-xs mt-2 text-center font-medium"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-zinc-400 text-[10px] text-center"
                        numberOfLines={2}
                      >
                        {item.character || "Unknown role"}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          )}
          {!isMovie && (
            <CardSection
              title="Seasons"
              data={details.seasons}
              isLoading={false}
            />
          )}
          {isMovie ? (
            <CardSection
              title="Similar Movies"
              data={similar}
              isLoading={false}
            />
          ) : (
            <CardSection
              title="Similar TV Shows"
              data={similar}
              isLoading={false}
            />
          )}
        </ScrollView>
        {toastMessage && (
          <Animated.View
            pointerEvents="none"
            style={{
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-18, 0],
                  }),
                },
              ],
              elevation: 50,
              zIndex: 50,
            }}
            className="absolute left-4 right-4 top-2 z-50 rounded-2xl border border-white/10 bg-[#18181b] px-4 py-3"
          >
            <Text className="text-center text-sm font-semibold text-white">
              {toastMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default DetailsScreen;
