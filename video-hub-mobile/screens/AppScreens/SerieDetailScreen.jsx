import React from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Footer from "../../components/Footer";
import EpisodeAccordion from "../../components/EpisodeAccordion";
import { useLibraryStore } from "../../store/useLibraryStore";

const { width, height } = Dimensions.get("window");

export default function SerieDetailScreen() {
  const FALLBACK_URI = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { serieId } = route.params;
  const { series,toggleDownload } = useLibraryStore();
  const serie = series.find((s) => s.id === serieId);
  const handleDownload = (serieId, episodeId) => {
  toggleDownload(serieId, episodeId);
  };
  const handleEpisodePlay = (serieId, episodeId) => {
  navigation.navigate("VideoPlayer", { serieId, episodeId });
};
 const handlePlay = () => {
  if (!serie) return;
  const all = serie.seasons
  .sort((a,b)=>a.order-b.order)
  .flatMap(sea => sea.episodes.sort((a,b)=>a.order-b.order));

const lastWatched = all.find(ep => ep.progress > 0 && ep.progress < 1);
const nextUnwatched = all.find(ep => ep.progress === 0);
const target = lastWatched || nextUnwatched || all[0];

navigation.navigate('VideoPlayer', {
  serieId: serie.id,
  episodeId: target.id,
  title: target.title,
  videoUri: target.videoUri || FALLBACK_URI,
});
};
if (!serie)
  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
        Series not found
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={[styles.imageContainer, { width: width }]}>
        <Image
          source={{ uri: serie?.poster }}
          resizeMode="cover"
          style={styles.bgimage}
        />
      </View>
      <View style={[styles.infoContainer, { width: width }]}>
        <Text style={styles.title}>{serie?.title}</Text>
        <Text style={styles.description}>
          {serie?.description ||
            "No description available for this series."}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonPlay} onPress={handlePlay}>
            <Ionicons name="play-circle" size={20} color="#000000ff" />
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
            {/*
          <TouchableOpacity style={styles.buttonDownload} onPress={handleDownload}>
            <Ionicons name="download" size={20} color="#000000ff" />
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          */}
        </View>
        
      </View>
      <View style={styles.bottomContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          <EpisodeAccordion seasons={serie?.seasons || []} serieId={serie.id} onDownload={handleDownload}onPlay={handleEpisodePlay}/>
        </ScrollView>
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  imageContainer: { flex: 1 },
  bgimage: { height: "100%", width: "100%" },
  infoContainer: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -20,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.05,
    textAlign: "center",
  },
  description: {
    color: "#ccc",
    fontSize: width * 0.035,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 10,
    lineHeight: 18,
    width: width * 0.9,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.9,
    marginTop: 10,
  },
  buttonPlay: {
    flexDirection: "row",
    width: "48%",
    height: height * 0.05,
    backgroundColor: "#C6A14A",
    borderRadius: width * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDownload: {
    flexDirection: "row",
    width: "48%",
    height: height * 0.05,
    backgroundColor: "#C6A14A",
    borderRadius: width * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: width * 0.04,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});
