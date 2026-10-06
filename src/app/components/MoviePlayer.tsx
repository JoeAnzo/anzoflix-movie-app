import React, { useEffect } from "react";
import { View } from "react-native";
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

  // 2. Ad Blocker Layer #1: Touch Protection & JavaScript Sanitizer Script
  // Automatically prevents invisible screen popunders and removes tracking elements.
  const adBlockerScript = `
    (function() {
      // Deactivate global popup prompts used by stream scripts to force tab routing
      window.open = function() { return null; };
      window.alert = function() { return null; };
      window.confirm = function() { return null; };
      
      const purgeAdElements = () => {
        const structuralBadSelectors = [
          'iframe[src*="ad"]', 
          'div[class*="ad-"]', 
          'div[id*="ad-"]', 
          '.popunder', 
          '#popunder',
          'div[class*="popup"]',
          'div[id*="popup"]',
          'a[href*="target=_blank"]',
          // Safety: strips any newly spawned iframe that doesn't explicitly link to your video source
          'iframe:not([src*="vidcore"]):not([src*="player"])'
        ];
        
        structuralBadSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            element.remove();
          });
        });
      };

      // Wipe malicious objects during initialization, then poll continuously every 400ms 
      // to kill lazy-loaded overlay targets when a user touches the canvas.
      purgeAdElements();
      setInterval(purgeAdElements, 400);
    })();
    true;
  `;

  return (
    // Clean NativeWind classes completely replace the old StyleSheet container
    <View className="flex-1 w-full h-full bg-black overflow-hidden">
      <WebView
        source={{ uri: sourceUrl }}
        className="flex-1 bg-black"
        originWhitelist={["https://*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false} // Lets video load up seamlessly in horizontal orientation
        allowsInlineMediaPlayback={true}
        startInLoadingState
        
        // Connect Layer 1 Protection
        injectedJavaScript={adBlockerScript}
        
        // 3. Ad Blocker Layer #2: Navigation & Redirect Interception
        // Catches malicious link requests immediately if a browser script evades Layer 1.
        onShouldStartLoadWithRequest={(request) => {
          const targetUrl = request.url;

          // Allow low-level browser initialization layers
          if (targetUrl === "about:blank" || targetUrl === "about:srcdoc") {
            return true;
          }

          // Whitelist: Only let the WebView connect to safe streaming structural assets
          if (
            targetUrl === sourceUrl || 
            targetUrl.includes("vidcore") || 
            targetUrl.includes("vidcor") || 
            request.mainDocumentURL?.includes("vidcore")
          ) {
            return true; 
          }
          
          // Drop and block any background reroutes, tracking clicks, or external adult URLs
          return false; 
        }}
      />
    </View>
  );
}
