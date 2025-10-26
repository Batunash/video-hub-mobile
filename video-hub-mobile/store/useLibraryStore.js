import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      series: [],
      lists: [],
      downloads: [],
      recentlyWatched: [],
      isLoading: false,
      error: null,

      // --- API ACTIONS ---
      fetchSeries: async () => {
  set({ isLoading: true, error: null });
  try {
    const res = await api.get("/media/async");

    // 🔹 Her episode’a bulunduğu seasonId’yi ekle
    const normalized = res.data.map((serie) => ({
      ...serie,
      seasons: serie.seasons.map((season) => ({
        ...season,
        episodes: season.episodes.map((ep) => ({
          ...ep,
          seasonId: season.id, // 💥 ekledik
        })),
      })),
    }));

    set({ series: normalized, isLoading: false });
  } catch (err) {
    console.error("fetchSeries error:", err);
    set({
      isLoading: false,
      error:
        err.response?.data?.message ||
        "Series yüklenemedi. Lütfen bağlantıyı kontrol et.",
    });
  }
},


      // --- LOCAL ACTIONS ---
      addList: ({ title, seriesIds }) =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: Date.now().toString(),
              title: title.trim(),
              seriesIds: [...new Set(seriesIds)],
            },
          ],
        })),

      toggleSerieInList: (listId, serieId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  seriesIds: list.seriesIds.includes(serieId)
                    ? list.seriesIds.filter((id) => id !== serieId)
                    : [...list.seriesIds, serieId],
                }
              : list
          ),
        })),

      toggleDownload: (serieId, episodeId, filePath = "") =>
        set((state) => {
          const alreadyDownloaded = state.downloads.some(
            (d) => d.episodeId === episodeId
          );

          const updatedSeries = state.series.map((s) =>
            s.id === serieId
              ? {
                  ...s,
                  seasons: s.seasons.map((sea) => ({
                    ...sea,
                    episodes: sea.episodes.map((ep) =>
                      ep.id === episodeId
                        ? { ...ep, downloaded: !ep.downloaded }
                        : ep
                    ),
                  })),
                }
              : s
          );

          const updatedDownloads = alreadyDownloaded
            ? state.downloads.filter((d) => d.episodeId !== episodeId)
            : [...state.downloads, { serieId, episodeId, path: filePath || null }];

          return { series: updatedSeries, downloads: updatedDownloads };
        }),

      markProgress: (serieId, episodeId, progress) =>
        set((state) => ({
          series: state.series.map((s) =>
            s.id === serieId
              ? {
                  ...s,
                  seasons: s.seasons.map((sea) => ({
                    ...sea,
                    episodes: sea.episodes.map((ep) =>
                      ep.id === episodeId ? { ...ep, progress } : ep
                    ),
                  })),
                }
              : s
          ),
        })),

      markRecentlyWatched: ({ serieId, episodeId }) =>
        set((s) => ({
          recentlyWatched: [
            { serieId, episodeId, watchedAt: Date.now() },
            ...s.recentlyWatched.filter((x) => x.episodeId !== episodeId),
          ].slice(0, 25),
        })),

      clearAll: () =>
        set({
          series: [],
          lists: [],
          downloads: [],
          recentlyWatched: [],
        }),
    }),
    {
      name: "video-hub-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        series: state.series,
        lists: state.lists,
        downloads: state.downloads,
        recentlyWatched: state.recentlyWatched,
      }),

    }
  )
);
