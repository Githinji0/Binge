import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Video } from '../types';
import VideoCard from './VideoCard';
import COLORS from '../constants/colors';

interface VideoShelfProps {
  title: string;
  videos: Video[];
}

export const VideoShelf: React.FC<VideoShelfProps> = React.memo(({ title, videos }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.shelfTitle}>{title}</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <VideoCard video={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={162} // Width + margin (150 + 12)
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  shelfTitle: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.3
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 4
  }
});

export default VideoShelf;
