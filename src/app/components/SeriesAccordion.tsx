import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "../context/AppContext";
import { fetchTvEpisode } from "../services/api";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  still_path: string | null;
  overview: string;
}

interface SeriesAccordionProps {
  seasons?: Season[];
  seriesId: string;
}

const AccordionItem = ({
  season,
  seriesId,
}: {
  season: Season;
  seriesId: string;
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedLanguage } = useApp();
  const {
    data: episodes = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "tv-season",
      seriesId,
      season.season_number,
      selectedLanguage,
    ],
    queryFn: async () => {
      const result = await fetchTvEpisode(
        seriesId,
        season.season_number,
        selectedLanguage,
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return (result.data.episodes ?? []) as Episode[];
    },
    enabled: isExpanded,
  });

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((expanded) => !expanded);
  };

  return (
    <View className="mb-3 overflow-hidden rounded-lg bg-[#1F1F1F]">
      <TouchableOpacity
        className="flex-row items-center p-3"
        onPress={toggleAccordion}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        {season.poster_path ? (
          <Image
            source={{ uri: `${TMDB_IMAGE_BASE}${season.poster_path}` }}
            className="h-[75px] w-[50px] rounded bg-neutral-800"
            resizeMode="cover"
          />
        ) : (
          <View className="h-[75px] w-[50px] rounded bg-neutral-800" />
        )}
        <View className="flex-1 justify-center pl-3">
          <Text className="text-base font-bold text-white">{season.name}</Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {season.episode_count} Episodes
          </Text>
        </View>
        <Text className="px-2 text-sm text-neutral-400">
          {isExpanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View className="border-t border-neutral-800 bg-[#141414] px-3 pb-2">
          {isPending && (
            <View className="py-6">
              <ActivityIndicator size="small" color="#E50914" />
            </View>
          )}

          {isError && (
            <View className="items-center py-4">
              <Text className="mb-2 text-center text-sm text-red-500">
                Failed to load episodes.
              </Text>
              <TouchableOpacity onPress={() => void refetch()}>
                <Text className="text-sm font-semibold text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isPending &&
            !isError &&
            (episodes.length > 0 ? (
              episodes.map((episode) => (
                <View
                  key={episode.id}
                  className="flex-row items-center border-b border-neutral-900 py-3"
                >
                  <TouchableOpacity
                    className="relative h-[56px] w-[100px] items-center justify-center overflow-hidden rounded bg-neutral-800"
                    onPress={() =>
                      router.push({
                        pathname: "/watch/[id]",
                        params: {
                          id: seriesId,
                          mediaType: "tv",
                          season: String(season.season_number),
                          episode: String(episode.episode_number),
                          title: `${season.name} · E${episode.episode_number}: ${episode.name}`,
                        },
                      })
                    }
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Watch ${season.name}, episode ${episode.episode_number}: ${episode.name}`}
                  >
                    {episode.still_path ? (
                      <Image
                        source={{
                          uri: `${TMDB_IMAGE_BASE}${episode.still_path}`,
                        }}
                        className="absolute h-full w-full"
                        resizeMode="cover"
                      />
                    ) : null}
                    <View className="items-center justify-center rounded-full bg-black/60 p-1">
                      <Ionicons name="play" size={22} color="white" />
                    </View>
                  </TouchableOpacity>
                  <View className="flex-1 pl-3">
                    <Text
                      className="text-sm font-medium text-white"
                      numberOfLines={1}
                    >
                      E{episode.episode_number}: {episode.name}
                    </Text>
                    <Text
                      className="mt-1 text-xs text-neutral-400"
                      numberOfLines={2}
                    >
                      {episode.overview || "No overview available."}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="py-4 text-center text-sm text-zinc-500">
                No episodes found.
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

const SeriesAccordion = ({
  seasons = [],
  seriesId,
}: SeriesAccordionProps) => {
  const validSeasons = seasons
    .filter((season) => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  return (
    <View className="my-1">
      <Text className="mb-4 text-xl font-bold text-white">Seasons</Text>
      {validSeasons.length > 0 ? (
        validSeasons.map((season) => (
          <AccordionItem
            key={season.id}
            season={season}
            seriesId={seriesId}
          />
        ))
      ) : (
        <Text className="text-sm text-zinc-500">No seasons found</Text>
      )}
    </View>
  );
};

export default SeriesAccordion;
