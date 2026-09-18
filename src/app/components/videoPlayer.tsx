import React from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import WebView from 'react-native-webview';

interface VideoPlayerProps {
  videoId?: string;
}

const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  if (!videoId) {
    return null;
  }

  const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (Platform.OS === 'web') {
    return (
      <Pressable
        onPress={() => window.open(trailerUrl, '_blank')}
        style={styles.webButton}
      >
        <Text style={styles.webButtonText}>Watch Trailer</Text>
      </Pressable>
    );
  }

  // FIXED: Added referrerpolicy attribute explicitly to the iframe
  const html = `
    <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&playsinline=1"
          frameborder="0"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="width:100%;height:100%;border:0;"
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ 
          html,
          baseUrl: 'https://youtube.com' 
        }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  webButton: {
    backgroundColor: '#E50914',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  webButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default VideoPlayer;
