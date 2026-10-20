import React, { useEffect } from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";

interface MoviePlayerProps {
  sourceUrl: string;
}

export default function MoviePlayer({ sourceUrl }: MoviePlayerProps) {
  
  // 1. Enforce Screen-Wide Landscape Locking
  useEffect(() => {
    async function lockOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    lockOrientation();

    // Reset back to Portrait when user exits this video player screen
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);


  return (

  <SafeAreaView>
    <View className="flex-1 w-full h-full bg-black overflow-hidden">
      <WebView
        source={{ uri: sourceUrl }}
        className="flex-1 bg-black"
        originWhitelist={["https://*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState
      />
    </View>
  </SafeAreaView>
  );
}
