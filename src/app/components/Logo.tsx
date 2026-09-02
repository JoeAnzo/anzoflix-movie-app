import {Text, View } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import LanguageSelector from './languageSelector';

const Logo = () => {
  return (
        <View className='flex-row items-center'>
            <View className='flex-row items-center gap-2'>
              <Text className='text-bold text-3xl py-4 text-[#E50914]'>AnzoFlix</Text>
              <MaterialCommunityIcons name="movie-open" size={24} color="#E50914" />
            </View>
        </View>
  )
}

export default Logo
