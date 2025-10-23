import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';

export default function VideoScreen() {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    (player) => {
      player.loop = false;
      player.play();
    }
  );

  useEffect(() => {
    let isMounted = true;

    async function setup() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (e) {
        console.log("setup error:", e);
      }
    }

    setup();

    return () => {
      isMounted = false;
      (async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          await NavigationBar.setVisibilityAsync("visible");
          if (player && player.release && isMounted) {
            await player.release();
          } else if (player?.release) {
            // Eğer zaten unmounted olmuşsa sessizce atla
            try { await player.release(); } catch {}
          }
        } catch (e) {
          console.log("cleanup error:", e);
        }
      })();
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar hidden />
    <VideoView
  style={{
    flex: 1,
    width: '90%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: 12, // köşeler yumuşasın istiyorsan
    overflow: 'hidden',
  }}
  player={player}
  allowsFullscreen
  contentFit="cover"
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
