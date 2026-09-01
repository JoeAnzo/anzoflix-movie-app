import { Text, View, FlatList } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { MovieSectionSkeleton } from './CardSkeleton';
import { renderCard } from './CardDisplay';

type Fetcher = (page?: number, language?: string) => Promise<any>;

interface MovieSectionProps {
  title: string;
  fetcher: Fetcher;
}

const CardSection = ({ title, fetcher }: MovieSectionProps) => {
  const { selectedLanguage } = useApp();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['card-section', title, selectedLanguage],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetcher(pageParam, selectedLanguage);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;

      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
  });

  const items = data?.pages.flatMap((page) => page.results ?? []) ?? [];

  if (isLoading && !data) {
    return <MovieSectionSkeleton />;
  }

  return (
    <View className="my-1">
      <Text className="text-white text-xl font-bold mb-2">{title}</Text>

      <FlatList
        data={items}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text className="text-zinc-400 px-3">Loading...</Text>
          ) : null
        }
        ListEmptyComponent={
          <Text className="text-zinc-500 text-sm">No items found</Text>
        }
      />
    </View>
  );
};

export default CardSection;
