import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useContent } from "../hooks/useContent";
import { useDebounce } from "../hooks/useDedounce";
import { searchContent } from "../services/api";

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const { data: searchResults = [], isLoading } = useContent(
    ["search", debouncedQuery],
    () => {
      const cleanedQuery = debouncedQuery.trim();

      if (!cleanedQuery) {
        return Promise.resolve({ success: true, data: { results: [] } });
      }

      return searchContent(cleanedQuery, 1);
    },
  );

  const filteredResults = (Array.isArray(searchResults) ? searchResults : [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 6);

  const handleSelect = (item: any) => {
    const mediaType =
      item.media_type === "movie" || item.media_type === "tv"
        ? item.media_type
        : "movie";

    router.push({
      pathname: `../details/${item.id}`,
      params: { mediaType },
    });

    setQuery("");
  };

  return (
    <View className="relative z-20" style={{ elevation: 20 }}>
      <View className="flex-row items-center justify-between gap-1">
        <TextInput
          value={query}
          onChangeText={setQuery}
          className="p-2.5 flex-1 rounded-md"
          placeholder="Search movies here and tv series"
          placeholderTextColor="#cbd5e1"
          style={{ backgroundColor: "rgba(51, 51, 51, 0.8)", color: "#fff" }}
        />
        <Ionicons name="search" size={24} color="white" />
      </View>

      {debouncedQuery.trim().length > 0 && (
        <View
          className="absolute left-0 right-0 top-12 z-50 mt-2 rounded-md bg-zinc-900 border border-zinc-800 overflow-hidden"
          style={{ elevation: 21 }}
        >
          {isLoading ? (
            <Text className="p-3 text-zinc-400">Searching...</Text>
          ) : filteredResults.length > 0 ? (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => `${item.id}-${item.media_type}`}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const title = item.title || item.name || "Unknown title";
                const posterUrl = item.poster_path
                  ? `https://image.tmdb.org/t/p/w92/${item.poster_path}`
                  : null;

                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    className="flex-row items-center justify-between px-3 py-2 border-b border-zinc-800"
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-white font-medium"
                        numberOfLines={2}
                      >
                        {title}
                      </Text>
                      <Text className="text-zinc-400 text-xs mt-1">
                        {item.media_type === "movie" ? "Movie" : "TV Show"}
                      </Text>
                    </View>

                    {posterUrl ? (
                      <Image
                        source={{ uri: posterUrl }}
                        className="w-12 h-16 rounded-md"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-12 h-16 rounded-md bg-zinc-800 items-center justify-center">
                        <Text className="text-zinc-400 text-[8px]">N/A</Text>
                      </View>
                    )}
                  </Pressable>
                );
              }}
            />
          ) : (
            <Text className="p-3 text-zinc-400">No results found</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default Search;
