import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HeroSection from '../../components/HeroSection';
import HorizontalList from '../../components/HorizontalList';
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../../store/useLibraryStore';

export default function MainScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lists, series } = useLibraryStore();

  const firstSerie = series?.[0];

  const handleSeeAll = (listId) => navigation.navigate('SeeAllScreen', { listId });
  const handlePlay = (serieId, episodeId) =>
    navigation.navigate('VideoPlayer', { serieId, episodeId });
  const handleAdd = () => navigation.navigate('CreateHorizontalViewScreen');
  const handleSerieDetail = (serieId) =>
    navigation.navigate('SerieDetailScreen', { serieId });
  const handleDownloads = () =>
    navigation.navigate('DownloadsScreen', { headerTitle: 'Downloads' });

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {!!firstSerie && (
        <HeroSection
          data={firstSerie}
          onComponentPress={() => handleSerieDetail(firstSerie.id)}
          onPlayPress={handlePlay}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

        <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.7}>
          <Ionicons name="add-circle" size={50} color="#000000ff" />
        </TouchableOpacity>
      </ScrollView>

      <Footer onDownloadsPress={handleDownloads} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 20, gap: 20, alignItems: 'center' },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C6A14A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.5,
  },
});
