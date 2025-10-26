import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useRoute } from "@react-navigation/native";
import { useLibraryStore } from "../../store/useLibraryStore";
import { API_URL } from "@env";
import api from "../../lib/api";

export default function VideoScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { serieId, seasonId = "s1", episodeId } = route.params;
  const { markProgress, markRecentlyWatched, series } = useLibraryStore();

  // 🎬 Progress bul (resume için)
  const serie = series.find((s) => s.id === serieId);
  const episode = serie?.seasons
    ?.flatMap((sea) => sea.episodes)
    ?.find((ep) => ep.id === episodeId);
  const resumeProgress = episode?.progress || 0;

  // 🔗 Backend video URL
  const videoUri = `${API_URL.replace("/api", "")}/api/series/${serieId}/${seasonId}/${episodeId}.mp4`;

  // 🎥 Player oluştur
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.play();
  });

  const [didSeek, setDidSeek] = useState(false);

  // 📈 Progress takibi + Resume sistemi
  useEffect(() => {
    if (!player) return;

    const sub = player.addListener("timeUpdate", async ({ currentTime, duration }) => {
      if (!duration) return;

      const progress = currentTime / duration;
      markProgress(serieId, episodeId, progress);

      // ⏩ Kaldığı yerden devam (tek seferlik)
      if (!didSeek && resumeProgress > 0.01 && resumeProgress < 0.98 && duration > 0) {
        const seekTime = duration * resumeProgress;
        console.log(
          `⏩ Resume to ${Math.floor(resumeProgress * 100)}% (${seekTime.toFixed(1)}s)`
        );
        await player.pause(); // durdur
        player.seekTo(seekTime); // sar
        await new Promise((r) => setTimeout(r, 200)); // bekle
        await player.play(); // yeniden başlat
        setDidSeek(true);
      }

      // 🔁 Her 5 saniyede backend'e kaydet
      if (Math.floor(currentTime) % 5 === 0) {
        try {
          await api.put(`/episode/${episodeId}/progress`, { progress });
        } catch (err) {
          console.warn("Progress sync failed:", err.message);
        }
      }
    });

    const endSub = player.addListener("ended", () => {
      markProgress(serieId, episodeId, 1);
      markRecentlyWatched({ serieId, episodeId });
    });

    return () => {
      sub?.remove?.();
      endSub?.remove?.();
    };
  }, [player, resumeProgress]);

  // 📺 Orientation ve navigation bar kontrolü
  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("hidden");
      }
    })();

    return () => {
      (async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        if (Platform.OS === "android") {
          await NavigationBar.setVisibilityAsync("visible");
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
        fullscreenOptions={{ enabled: true }}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  video: {
    flex: 1,
    width: "90%",
    height: "100%",
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
});
