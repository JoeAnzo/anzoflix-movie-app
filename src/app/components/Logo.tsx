import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, View } from "react-native";

const Logo = () => {
  return (
    <View className="flex-row items-center gap-2" style={{ flexShrink: 0 }}>
      <MaterialCommunityIcons name="movie-open" size={24} color="#E50914" />
      <Text
        className="text-3xl font-bold leading-9 text-[#E50914]"
        numberOfLines={1}
      >
        AnzoFlix
      </Text>
    </View>
  );
};

export default Logo;
