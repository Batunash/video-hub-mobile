import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import EpisodeGroup from "./EpisodeGroup";

export default function EpisodeAccordion({ seasons, serieId, onDownload, onPlay }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Episodes</Text>
      {seasons.map((season) => (
        <EpisodeGroup
          key={season.id}
          serieId={serieId}
          title={season.title}
          episodes={season.episodes}
          isExpanded={expandedId === season.id}
          onToggle={() => handleToggle(season.id)}
          onDownload={onDownload} // ✅ callback prop olarak gönder
          onPlay={onPlay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  header: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
});
