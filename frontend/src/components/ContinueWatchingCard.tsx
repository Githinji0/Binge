import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WatchHistoryEntry } from '../types';
import COLORS from '../constants/colors';

interface ContinueWatchingCardProps {
  entry: WatchHistoryEntry;
  width?: number;
}

const getRemainingTimeText = (progress: number, duration: number): string => {
  const remainingSeconds = duration - progress;
  if (remainingSeconds <= 0) return 'Finished';
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  if (remainingMinutes < 60) {
    return `${remainingMinutes}m left`;
  }
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMinsOffset = remainingMinutes % 60;
  return remainingMinsOffset > 0
    ? `${remainingHours}h ${remainingMinsOffset}m left`
    : `${remainingHours}h left`;
};

export const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = React.memo(({ entry, width = 200 }) => {
  const { video, progressSeconds } = entry;

  if (!video) return null;

  const progressPercentage = Math.min((progressSeconds / video.duration) * 100, 100);

  const handlePress = () => {
    router.push(`/player/${video._id}`);
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
        
        {/* Play overlay button */}
        <View style={styles.playIconOverlay}>
          <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.9)" />
        </View>

        {/* Progress Bar container */}
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {video.title}
        </Text>
        <View style={styles.subInfoRow}>
          <Text style={styles.category} numberOfLines={1}>
            {video.category}
          </Text>
          <Text style={styles.remainingText}>
            {getRemainingTimeText(progressSeconds, video.duration)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    overflow: 'hidden'
  },
  thumbnailContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#444'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary
  },
  infoContainer: {
    padding: 8
  },
  title: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold'
  },
  subInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  category: {
    color: COLORS.muted,
    fontSize: 10,
    flex: 1,
    marginRight: 6
  },
  remainingText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600'
  }
});

export default ContinueWatchingCard;
