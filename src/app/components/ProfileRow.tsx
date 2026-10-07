import { Ionicons } from "@expo/vector-icons";
import {Pressable,View,Text} from "react-native"


type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  destructive?: boolean;
};

export default function ProfileRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  destructive = false,
}: ProfileRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-4 py-4 active:bg-white/5"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${destructive ? "bg-red-500/10" : "bg-white/5"}`}
      >
        <Ionicons
          name={icon}
          size={19}
          color={destructive ? "#f87171" : "#d4d4d8"}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className={`text-sm font-semibold ${destructive ? "text-red-400" : "text-white"}`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-xs text-zinc-500">{subtitle}</Text>
        ) : null}
      </View>
      {trailing ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={17} color="#71717a" />
        ) : null)}
    </Pressable>
  );
}
