import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CardSection from "../components/CardSection";
import Logo from "../components/Logo";
import Search from "../components/Search";
import {
    airingTodayShows,
    nowPlayingMovies,
    onTheAirShows,
    popularMovies,
    popularTvShows,
    topRatedMovies,
    topRatedTv,
    upcomingMovies,
} from "../services/api";

const Home = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sectionsWithErrors, setSectionsWithErrors] = useState<Set<string>>(
    () => new Set(),
  );
  const hasFetchError = sectionsWithErrors.size > 0;

  const handleInitialFetchErrorChange = useCallback(
    (title: string, hasError: boolean) => {
      setSectionsWithErrors((current) => {
        if (current.has(title) === hasError) {
          return current;
        }

        const next = new Set(current);
        if (hasError) {
          next.add(title);
        } else {
          next.delete(title);
        }
        return next;
      });
    },
    [],
  );

  return (
    <View className="bg-[#141414] flex-1 p-2">
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
        {!hasFetchError && (
          <Search screen="home" placeholder="Search movies here and tv series" />
        )}
      </View>

      <ScrollView
        className="bg-[#141414]"
        showsVerticalScrollIndicator={false}
        style={{ display: hasFetchError ? "none" : "flex" }}
      >
        <View className="p-2 gap-4">
          <Text className="text-white text-2xl">Movies</Text>

          <CardSection
            title="Now Playing"
            fetcher={nowPlayingMovies}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="Trending"
            fetcher={popularMovies}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="Upcoming"
            fetcher={upcomingMovies}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="Top Rated"
            fetcher={topRatedMovies}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />

          <Text className="text-white text-2xl">Tv Shows</Text>

          <CardSection
            title="Airing Today"
            fetcher={airingTodayShows}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="On Tv"
            fetcher={onTheAirShows}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="Popular"
            fetcher={popularTvShows}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
          <CardSection
            title="Top Rated"
            fetcher={topRatedTv}
            onInitialFetchErrorChange={handleInitialFetchErrorChange}
          />
        </View>
      </ScrollView>
      {hasFetchError && (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cloud-offline-outline" size={44} color="#a1a1aa" />
          <Text className="mt-4 text-center text-lg font-semibold text-white">
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-sm text-zinc-400">
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity
            className="mt-5 rounded-md bg-[#E50914] px-5 py-3"
            onPress={() =>
              void queryClient.refetchQueries({
                queryKey: ["card-section"],
                type: "active",
              })
            }
            accessibilityRole="button"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Home;
