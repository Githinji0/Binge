import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Video } from '../types';
import COLORS from '../constants/colors';
import { useFavorites } from '../hooks/useFavorites';
import { useDashboardData } from '../hooks/useDashboardData';

interface VideoCardProps {
  video: Video;
  width?: number;
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
};

export const VideoCard: React.FC<VideoCardProps> = React.memo(({ video, width = 150 }) => {
  const { toggleFavorite } = useFavorites();
  const { favorites } = useDashboardData();
  const isFavorite = favorites.some((fav) => fav._id === video._id);

  const handlePress = () => {
    router.push(`/player/${video._id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation(); // Prevent card tap triggering
    toggleFavorite(video);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, { width }]} android_ripple={{ color: '#333' }}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.durationChip}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isFavorite ? COLORS.primary : COLORS.secondary}
          />
        </TouchableOpacity>
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={44} color="rgba(255,255,255,0.85)" />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {video.title}
      </Text>
      <Text style={styles.category} numberOfLines={1}>
        {video.category}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 8
  },
  thumbnailContainer: {
    height: 100,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    position: 'relative'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  durationChip: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3
  },
  durationText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold'
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    opacity: 0
  },
  title: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6
  },
  category: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2
  }
});

export default VideoCard;
