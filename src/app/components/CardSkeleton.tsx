import { useEffect, useState } from "react";
import { Animated, FlatList, StyleSheet, View } from "react-native";

export const SingleCardSkeleton = () => {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    // Explicit styles ensure width and side-by-side margins are maintained
    <Animated.View style={[styles.cardContainer, { opacity: pulseAnim }]}>
      <View className="w-[110px] h-[160px] rounded-lg bg-zinc-800" />
      <View className="h-3 w-20 mt-2 rounded bg-zinc-800" />
      <View className="h-3 w-14 mt-1 rounded bg-zinc-800" />
    </Animated.View>
  );
};

export const MovieCardSkeleton = SingleCardSkeleton;

interface MovieSectionSkeletonProps {
  titleWidth?: string;
}

export const MovieSectionSkeleton = ({
  titleWidth = "w-36",
}: MovieSectionSkeletonProps) => {
  const dummyData = Array.from({ length: 5 }, (_, i) => i);

  return (
    <View className="my-1 w-full">
      <View className={`mb-4 h-7 rounded bg-zinc-800 ${titleWidth}`} />

      <FlatList
        data={dummyData}
        renderItem={() => <MovieCardSkeleton />}
        keyExtractor={(item) => item.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        // Native properties to guarantee row expansion
        style={styles.listMinWidth}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 110,
    marginRight: 16,
  },
  listMinWidth: {
    width: "100%",
  },
  listContent: {
    flexDirection: "row",
    paddingRight: 16,
  },
});
