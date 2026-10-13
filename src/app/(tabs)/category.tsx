import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Logo from "../components/Logo";
import Search from "../components/Search";


const Category = () => {
  const router = useRouter();

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
        <Search screen="category" placeholder="Search genres here" />
      </View>
      <ScrollView className="bg-[#141414]" showsVerticalScrollIndicator={false}>
        <View className="p-2 gap-4">
          <Text className="text-white text-2xl">Genres</Text>
          </View>
      </ScrollView>
    </View>
  );
};

export default Category
