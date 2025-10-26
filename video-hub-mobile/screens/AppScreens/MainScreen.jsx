
import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HeroSection from "../../components/HeroSection";
import HorizontalList from "../../components/HorizontalList";
import Footer from "../../components/Footer";
import { useNavigation } from "@react-navigation/native";
import { useLibraryStore } from "../../store/useLibraryStore";

export default function MainScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lists, series, fetchSeries, isLoading, error } = useLibraryStore();
  const firstSerie = series?.[0];

  // 🔹 İlk açılışta dizi verilerini yükle
  useEffect(() => {
    fetchSeries();
  }, []);

  // 🔹 Yüklenme durumu
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C6A14A" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading series...</Text>
      </View>
    );
  }

  // 🔹 Hata durumu
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  // 🔹 Boş veri durumu
  if (!series || series.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#aaa" }}>No series found.</Text>
        <TouchableOpacity onPress={fetchSeries} style={styles.reloadBtn}>
          <Ionicons name="refresh" size={24} color="#C6A14A" />
          <Text style={{ color: "#C6A14A", marginLeft: 6 }}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Ekran render ---
  const handleSeeAll = (listId) =>
    navigation.navigate("SeeAllScreen", { listId });
  const handlePlay = (serie) => {
  const firstSeason = serie.seasons?.[0];
  const firstEpisode = firstSeason?.episodes?.[0];

  if (!firstSeason || !firstEpisode) {
    console.warn("No season/episode found for", serie.id);
    return;
  }

  navigation.navigate("VideoPlayer", {
    serieId: serie.id,
    seasonId: firstSeason.id,
    episodeId: firstEpisode.id,
  });
};

  const handleAdd = () => navigation.navigate("CreateHorizontalViewScreen");
  const handleSerieDetail = (serieId) =>
    navigation.navigate("SerieDetailScreen", { serieId });
  const handleDownloads = () =>
    navigation.navigate("DownloadsScreen", { headerTitle: "Downloads" });

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Ana hero banner */}
      {!!firstSerie && (
        <HeroSection
          data={firstSerie}
          onComponentPress={() => handleSerieDetail(firstSerie.id)}
          onPlayPress={() => handlePlay(firstSerie)}
        />

      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Kullanıcı listeleri */}
        {Array.isArray(lists) &&
          lists.length > 0 &&
          lists.map((list) => {
            const listSeries = list.seriesIds
              .map((id) => series.find((s) => s.id === id))
              .filter(Boolean);

            return (
              <HorizontalList
                key={list.id}
                title={list.title}
                data={listSeries}
                onSeeAll={() => handleSeeAll(list.id)}
                onCardPress={(serie) => handleSerieDetail(serie.id)}
              />
            );
          })}

        {/* Liste oluşturma butonu */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={50} color="#000000ff" />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <Footer onDownloadsPress={handleDownloads} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { paddingBottom: 20, gap: 20, alignItems: "center" },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C6A14A",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.5,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  reloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
});
