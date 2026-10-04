import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

interface MoviePlayerProps {
  sourceUrl: string;
}

export default function MoviePlayer({ sourceUrl }: MoviePlayerProps) {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: sourceUrl }}
        style={styles.player}
        originWhitelist={["https://*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction
        allowsInlineMediaPlayback
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  player: {
    flex: 1,
    backgroundColor: "#000",
  },
});
