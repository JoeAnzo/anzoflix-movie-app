import { ScrollView, Text, View,TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CardSection from '../components/CardSection';
import Logo from '../components/Logo';
import Search from '../components/Search';
import {
  nowPlayingMovies,
  popularMovies,
  upcomingMovies,
  topRatedMovies,
  onTheAirShows,
  airingTodayShows,
  popularTvShows,
  topRatedTv,
} from '../services/api';


const Home = () => {

  const router = useRouter();

  return (
    <View className='bg-black flex-1 p-2'>
      <View className='p-2'>
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

      <ScrollView className='bg-black' showsVerticalScrollIndicator={false}>
        <View className='p-2 gap-4'>
          <Text className='text-white text-2xl'>Movies</Text>

          <CardSection title='Now Playing' fetcher={nowPlayingMovies} />
          <CardSection title='Trending' fetcher={popularMovies} />
          <CardSection title='Upcoming' fetcher={upcomingMovies} />
          <CardSection title='Top Rated' fetcher={topRatedMovies} />

          <Text className='text-white text-2xl'>Tv Shows</Text>

          <CardSection title='Airing Today' fetcher={airingTodayShows} />
          <CardSection title='On Tv' fetcher={onTheAirShows} />
          <CardSection title='Popular' fetcher={popularTvShows} />
          <CardSection title='Top Rated' fetcher={topRatedTv} />
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

