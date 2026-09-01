import { ScrollView, Text, View } from 'react-native';
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

const home = () => {
  return (
    <View className='bg-black flex-1 p-2'>
      <View className='p-2'>
        <Logo />
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

export default home;

