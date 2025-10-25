import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { mockSeries } from '../data/mockData'
import { mockLists } from '../data/mockList'

// 🔸 Her şey bu store'dan yönetilecek:
// series  → dizi verileri (id, sezon, bölüm, poster vs.)
// lists   → kullanıcı oluşturduğu yatay view'ler
// downloads → indirilen bölümler
// recentlyWatched → son izlenen bölümler

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
     series: mockSeries.series,

    downloads: mockSeries.series.flatMap((serie) =>
      serie.seasons.flatMap((season) =>
        season.episodes
          .filter((ep) => ep.downloaded)
          .map((ep) => ({
          serieId: serie.id,
          episodeId: ep.id,
          path: null, // istersen ileride dosya yolu eklersin
          }))
        )
      ),
      
      lists: mockLists || [],
      recentlyWatched: [],

      // --- ACTIONS ---

      // ✅ Yeni liste oluştur (kullanıcı title ve seçtiği dizileri gönderir)
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

      // ✅ Listeye dizi ekle / çıkar (toggle)
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

      // ✅ Bir bölümü indirildi olarak işaretle (flag + downloads listesi senkron)
      toggleDownload: (serieId, episodeId, filePath = '') =>
        set((state) => {
          const alreadyDownloaded = state.downloads.some(
            (d) => d.episodeId === episodeId
          )

          // Series içindeki episode flag'ini değiştir
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
          )

          // Downloads listesinde toggle
          const updatedDownloads = alreadyDownloaded
            ? state.downloads.filter((d) => d.episodeId !== episodeId)
            : [
                ...state.downloads,
                { serieId, episodeId, path: filePath || null },
              ]

          return { series: updatedSeries, downloads: updatedDownloads }
        }),

      // ✅ İzlenme ilerlemesi
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

      // ✅ Son izlenenler listesi
      // store
      markRecentlyWatched: ({ serieId, episodeId }) =>
        set((s) => ({
          recentlyWatched: [
            { serieId, episodeId, watchedAt: Date.now() },
            ...s.recentlyWatched.filter((x) => x.episodeId !== episodeId),
          ].slice(0, 25),
        })),

      // ✅ Her şeyi temizle (debug için)
      clearAll: () =>
        set({
          lists: [],
          downloads: [],
          recentlyWatched: [],
        }),
    }),
    {
      name: 'video-hub-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize:(state) =>({
        lists:state.lists,
        downloads:state.downloads,
        recentlyWatched:state.recentlyWatched,
      }),
    }
  )
)
