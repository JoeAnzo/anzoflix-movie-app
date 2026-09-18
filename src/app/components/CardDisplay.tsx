import { Text, View, Image, Pressable } from "react-native";
import { MovieItem } from "../interfaces/content.interfaces";
import { useRouter } from 'expo-router';

const MovieCard = ({ item }: { item: MovieItem }) => {
        const router = useRouter();
    if (!item.poster_path) return null;

    const posterUrl = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;

        const inferredMediaType = item.media_type === 'tv' || item.name ? 'tv' : 'movie';
    
    const handlePress = () => {
        router.push({
            pathname: `../details/${item.id}`,
            params: { mediaType: inferredMediaType }
        });
    };

    return (
        <Pressable onPress={handlePress}>
            <View className="mr-4" style={{ width: 110 }}>
                <Image 
                source={{ uri: posterUrl }} 
                className="w-[110px] h-[160px] rounded-md bg-[#27272a]"
                resizeMode="cover"
                />
                <Text 
                className="text-white text-xs mt-2 font-medium" 
                numberOfLines={2}
                >
                {item.title || item.name}
                </Text>
            </View>
        </Pressable>
    );
};

export const renderCard = ({ item }: { item: MovieItem }) => <MovieCard item={item} />;

 