import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { cardSectionQueryKey } from "../components/CardSection";
import Logo from "../components/Logo";
import Search from "../components/Search";
import { useApp } from "../context/AppContext";
import {
  fetchMovieGenres,
  fetchTvGenres,
  popularMovies,
  popularTvShows,
} from "../services/api";

interface Genre {
  id: number;
  name: string;
}

interface PopularItem {
  id: number;
  genre_ids: number[];
  poster_path: string | null;
}

interface PopularPage {
  page: number;
  results: PopularItem[];
  total_pages: number;
}

interface GenreSectionProps {
  title: string;
  genres: Genre[];
  popularItems: PopularItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  fallbackIcon: "film-outline" | "tv-outline";
}

const GenreSection = ({
  title,
  genres,
  popularItems,
  isLoading,
  isError,
  onRetry,
  fallbackIcon,
}: GenreSectionProps) => (
  <View className="gap-4">
    <Text className="text-2xl font-bold text-white">{title}</Text>

    {isLoading ? (
      <ActivityIndicator color="#E50914" />
    ) : isError ? (
      <View className="flex-row items-center justify-between rounded-lg bg-zinc-900 p-4">
        <Text className="mr-4 flex-1 text-sm text-zinc-400">
          Couldn’t load {title.toLowerCase()} genres. Check your connection and
          try again.
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={`Retry loading ${title.toLowerCase()} genres`}
          className="rounded-md bg-[#E50914] px-4 py-2"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    ) : genres.length > 0 ? (
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {genres.map((genre) => {
          const representativeItem = popularItems.find(
            (item) => item.genre_ids?.includes(genre.id) && item.poster_path,
          );

          return (
            <View key={genre.id} style={{ width: "48%" }}>
              {representativeItem?.poster_path ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500${representativeItem.poster_path}`,
                  }}
                  className="w-full rounded-lg bg-zinc-900"
                  style={{ aspectRatio: 0.72 }}
                  resizeMode="cover"
                  accessibilityLabel={`${genre.name} genre poster`}
                />
              ) : (
                <View
                  className="w-full items-center justify-center rounded-lg bg-zinc-900"
                  style={{ aspectRatio: 0.72 }}
                >
                  <Ionicons name={fallbackIcon} size={38} color="#71717a" />
                </View>
              )}
              <Text className="mt-2 text-base font-semibold text-white">
                {genre.name}
              </Text>
            </View>
          );
        })}
      </View>
    ) : (
      <Text className="text-sm text-zinc-500">No genres found.</Text>
    )}
  </View>
);

const Category = () => {
  const router = useRouter();
  const { selectedLanguage } = useApp();

  const movieGenresQuery = useQuery({
    queryKey: ["movie-genres", selectedLanguage],
    queryFn: async () => {
      const result = await fetchMovieGenres(selectedLanguage);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data.genres as Genre[];
    },
  });

  const tvGenresQuery = useQuery({
    queryKey: ["tv-genres", selectedLanguage],
    queryFn: async () => {
      const result = await fetchTvGenres(selectedLanguage);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data.genres as Genre[];
    },
  });

  const popularMoviesQuery = useInfiniteQuery({
    queryKey: cardSectionQueryKey("Trending", selectedLanguage),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await popularMovies(pageParam, selectedLanguage);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data as PopularPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });

  const popularTvQuery = useInfiniteQuery({
    queryKey: cardSectionQueryKey("Popular", selectedLanguage),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await popularTvShows(pageParam, selectedLanguage);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data as PopularPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });

  const popularMoviesList =
    popularMoviesQuery.data?.pages.flatMap((page) => page.results) ?? [];
  const popularTvList =
    popularTvQuery.data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <View className="flex-1 bg-[#141414] p-2">
      <View className="gap-2">
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center gap-2">
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
        <Search screen="category" placeholder="Search genres here" />
      </View>

      <ScrollView
        className="mt-4 bg-[#141414]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8, gap: 28, paddingBottom: 24 }}
      >
        <GenreSection
          title="Movie Genres"
          genres={movieGenresQuery.data ?? []}
          popularItems={popularMoviesList}
          isLoading={
            movieGenresQuery.isPending || popularMoviesQuery.isPending
          }
          isError={movieGenresQuery.isError || popularMoviesQuery.isError}
          onRetry={() => {
            void movieGenresQuery.refetch();
            void popularMoviesQuery.refetch();
          }}
          fallbackIcon="film-outline"
        />
        <GenreSection
          title="TV Show Genres"
          genres={tvGenresQuery.data ?? []}
          popularItems={popularTvList}
          isLoading={tvGenresQuery.isPending || popularTvQuery.isPending}
          isError={tvGenresQuery.isError || popularTvQuery.isError}
          onRetry={() => {
            void tvGenresQuery.refetch();
            void popularTvQuery.refetch();
          }}
          fallbackIcon="tv-outline"
        />
      </ScrollView>
    </View>
  );
};

export default Category;
