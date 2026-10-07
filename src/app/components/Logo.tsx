import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, View } from "react-native";

const Logo = () => {
  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="movie-open" size={24} color="#E50914" />
        <Text className="text-bold text-3xl text-[#E50914]">AnzoFlix</Text>
      </View>
    </View>
  );
};

export default Logo;
