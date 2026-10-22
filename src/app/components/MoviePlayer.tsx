import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import WebView from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";

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
    <View style={{ flex: 1, width: "100%", backgroundColor: "#000" }}>
      <WebView
        source={{ uri: sourceUrl }}
        style={{ flex: 1, backgroundColor: "#000" }}
        originWhitelist={["https://*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState
        renderLoading={() => (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
            }}
          >
            <ActivityIndicator color="#E50914" />
          </View>
        )}
      />
    </View>
  );
}
