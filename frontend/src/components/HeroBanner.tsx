import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Video } from '../types';
import COLORS from '../constants/colors';
import { useFavorites } from '../hooks/useFavorites';
import { useDashboardData } from '../hooks/useDashboardData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroBannerProps {
  video: Video | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = React.memo(({ video }) => {
  const { toggleFavorite } = useFavorites();
  const { favorites } = useDashboardData();

  if (!video) {
    return (
      <View style={[styles.container, styles.placeholderContainer]}>
        <Text style={styles.placeholderText}>Featured Title</Text>
      </View>
    );
  }

  const isFavorite = favorites.some((fav) => fav._id === video._id);

  const handlePlayPress = () => {
    router.push(`/player/${video._id}`);
  };

  const handleListPress = () => {
    toggleFavorite(video);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: video.thumbnail }}
        style={styles.bannerImage}
        contentFit="cover"
        transition={300}
      />
      {/* Sequential transparent views mimicking a bottom fade gradient */}
      <View style={[styles.overlay, { backgroundColor: 'rgba(15,15,15,0.2)' }]} />
      <View style={[styles.overlay, { backgroundColor: 'rgba(15,15,15,0.5)', top: '50%' }]} />
      <View style={[styles.overlay, { backgroundColor: 'rgba(15,15,15,0.95)', top: '85%' }]} />

      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{video.category.toUpperCase()}</Text>
        <Text style={styles.title}>{video.title}</Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleListPress}
            style={styles.iconButton}
            android_ripple={{ color: '#444' }}
          >
            <Ionicons
              name={isFavorite ? 'checkmark' : 'add'}
              size={24}
              color={COLORS.secondary}
            />
            <Text style={styles.buttonSubText}>My List</Text>
          </Pressable>

          <Pressable
            onPress={handlePlayPress}
            style={styles.playButton}
            android_ripple={{ color: '#ddd' }}
          >
            <Ionicons name="play" size={24} color={COLORS.background} />
            <Text style={styles.playButtonText}>Play</Text>
          </Pressable>

          <View style={styles.iconButton}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.buttonSubText}>Info</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 480,
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: COLORS.background
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface
  },
  placeholderText: {
    color: COLORS.muted,
    fontSize: 16
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  category: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8
  },
  title: {
    color: COLORS.secondary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10
  },
  playButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  playButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 60
  },
  buttonSubText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500'
  }
});

export default HeroBanner;
