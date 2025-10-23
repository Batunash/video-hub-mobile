import React from "react";
import { useRoute } from '@react-navigation/native';
import BaseListScreen from "./BaseListScreen";
import { useNavigation } from '@react-navigation/native';
export default function SeeAllScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { headerTitle, listData } = route.params || {};

  const mySeries = listData || [
    { id: "1", name: "The Witcher", year: 2022, genre: "Fantasy" },
    { id: "2", name: "Arcane", year: 2021, genre: "Animation" },
    { id: "3", name: "Cyberpunk: Edgerunners", year: 2022, genre: "Sci-Fi" },
  ];
   const handleSeriePress=()=>{
    navigation.navigate('SerieDetailScreen');
  }
  const handlePlay=()=>{
      navigation.navigate('VideoPlayer');
    }

  return (
    <BaseListScreen
      headerTitle={headerTitle || "My List"}
      listData={mySeries}
      onSeriePress={handleSeriePress}
      onPlayPress={handlePlay}
    />
  );
}
