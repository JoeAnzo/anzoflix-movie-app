
import { Text, View, Image, ScrollView,Dimensions,TouchableOpacity, FlatList, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {useRouter} from 'expo-router'
import { useContent } from '../hooks/useContent';
import Logo from '../components/Logo';
import CardSection from '../components/CardSection';
import VideoPlayer from '../components/videoPlayer';
import { fetchMovieDetails, fetchTvDetails,fetchSimilarMovies,fetchSimilarTvs} from '../services/api';
import { formatRuntime } from '../utils/utils';

const DetailsScreen = () => {
  const router = useRouter();
  const { id, mediaType } = useLocalSearchParams<{ id: string; mediaType: 'movie' | 'tv' }>();
  const { width:screenWidth} = Dimensions.get('window');
  const { data: details, isLoading: isLoadingDetails, error: detailsError } = useContent(
    ['details', mediaType, id],
    () => mediaType === 'movie' ? fetchMovieDetails(Number(id)) : fetchTvDetails(Number(id))
  );

  const { data: similar, isLoading: isLoadingSimilar, error: similarError } = useContent(
    ['similar', mediaType, id],
    () => mediaType === 'movie' ? fetchSimilarMovies(Number(id)) : fetchSimilarTvs(Number(id))
  );

  const isMovie = mediaType === 'movie';
  const cast = details?.credits?.cast ?? [];
  const trailer = details?.videos?.results?.find(
    (video: { type?: string; site?: string; key?: string }) =>
      video.type === 'Trailer' && video.site === 'YouTube' && video.key
  ) ?? null;

  const posterUrl = `https://image.tmdb.org/t/p/w500/${details?.poster_path}`;
  if (isLoadingDetails || isLoadingSimilar) {
    return (
      <View className='p-2 flex-1 bg-black'>
        <View className="flex-row items-center justify-between px-2 py-3">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-2 rounded-full bg-zinc-800"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Logo />
          <View className="w-10" /> 
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View className="w-full h-[30vh] rounded-md bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-8 w-3/4 mt-4 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-5 w-1/2 mt-3 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-5 w-2/3 mt-3 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-5 w-1/2 mt-3 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-20 w-full mt-4 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
          <Animated.View className="h-8 w-32 mt-6 rounded bg-zinc-800" style={{ opacity: 0.65 }} />
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
        <Text className="text-red-500 text-center">Something went wrong.</Text>
      </View>
    );
  }

  
  return (
    <View className='p-2 flex-1 bg-black'>
      <View className="flex-row items-center gap-2 px-2 py-3">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Logo />
        <View className="w-10" /> 
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
            <Image 
            source={{ uri: posterUrl }} 
            style={{width:screenWidth}}
            className="aspect-[2/3] rounded-md"
            resizeMode="contain"
            />
        </View>
        <View>
          <Text className='text-white text-3xl py-2 font-bold'>{isMovie ? details.title : details.name}</Text>
        </View>
        <Text className='text-white text-lg py-2 font-bold'>Duration: {formatRuntime(details.runtime)}</Text>
        <Text className='text-white text-lg py-2 font-bold'>Genres:{details.genres?.map((g: { name: string }) => g.name).join(', ')}</Text>
        {
          !isMovie && 
          <View>
            <Text className='text-white text-lg py-2 font-bold'>Seasons:{details.number_of_seasons}</Text>
            <Text className='text-white text-lg py-2 font-bold'>Episodes:{details.number_of_episodes}</Text>
          </View>
        }
        <Text className='text-white text-xl font-bold'>Over view:</Text>
        <Text className='text-white text-sm'>{details.overview}</Text>

        {trailer && (
          <View className="mt-4">
            <Text className='text-white text-xl font-bold mb-3'>Trailer</Text>
            <VideoPlayer videoId={trailer.key} />
          </View>
        )}

        {cast.length > 0 && (
          <View className="mt-5">
            <Text className='text-white text-xl font-bold mb-3'>Cast</Text>
            <FlatList
              data={cast.slice(0, 10)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.id ?? item.name ?? 'cast'}-${index}`}
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
                    <Text className='text-white text-xs mt-2 text-center font-medium' numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text className='text-zinc-400 text-[10px] text-center' numberOfLines={2}>
                      {item.character || 'Unknown role'}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        )}
        {
          !isMovie && <CardSection title="Seasons" data={details.seasons} isLoading={false} />
        }
        {
          isMovie ? <CardSection title="Similar Movies" data={similar} isLoading={false} /> : <CardSection title="Similar TV Shows" data={similar} isLoading={false}/>
        }
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;


