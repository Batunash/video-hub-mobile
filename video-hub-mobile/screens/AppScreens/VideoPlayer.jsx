import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useRoute } from '@react-navigation/native';
import { useLibraryStore } from '../../store/useLibraryStore';

const FALLBACK_URI =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { serieId, episodeId, videoUri } = route.params;
  const { markProgress, markRecentlyWatched } = useLibraryStore();

  const player = useVideoPlayer(videoUri || FALLBACK_URI, (player) => {
    player.loop = false;
    player.play();
    player.timeUpdateEventInterval = 1;
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('timeUpdate', ({ currentTime, duration }) => {
      if (!duration) return;
      const progress = currentTime / duration;
      markProgress(serieId, episodeId, progress);
    });
    const endSub = player.addListener('ended', () => {
      markProgress(serieId, episodeId, 1);
      markRecentlyWatched({ serieId, episodeId });
    });
    return () => {
      sub?.remove?.();
      endSub?.remove?.();
    };
  }, [player, serieId, episodeId]);

  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      }
    })();

    return () => {
      (async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('visible');
        }
        await player?.release?.();
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
        style={styles.video}
        player={player}
        allowsFullscreen
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  video: {
    flex: 1,
    width: '90%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
