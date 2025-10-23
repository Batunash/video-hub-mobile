import React from "react";
import { useRoute } from "@react-navigation/native";
import BaseListScreen from "./BaseListScreen";
import { useNavigation } from '@react-navigation/native';
export default function DownloadsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { headerTitle, listData } = route.params || {};
  const downloadedSeries = listData || [
    { id: "1", name: "Breaking Bad", year: 2008, genre: "Crime" },
    { id: "2", name: "Naruto", year: 2002, genre: "Action" },
    { id: "3", name: "Peaky Blinders", year: 2013, genre: "Drama" },
  ];
  const handleSeriePress=()=>{
    navigation.navigate('SerieDetailScreen');
  }
  const handlePlay=()=>{
      navigation.navigate('VideoPlayer');
    }
  return (
    <BaseListScreen
      headerTitle={headerTitle || "Downloads"}
      listData={downloadedSeries}
      onSeriePress={handleSeriePress}
      onPlayPress={handlePlay}
    />
  );
}
