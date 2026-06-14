import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideos } from '../../hooks/useVideos';
import { useDashboardData } from '../../hooks/useDashboardData';
import api from '../../services/api';
import COLORS from '../../constants/colors';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { videos, loading: loadingVideos } = useVideos();
  const { continueWatching, recentActivity, loading: loadingDashboard } = useDashboardData();
  const [orientationLocked, setOrientationLocked] = useState(false);

  // Find the video details
  const video = videos.find((v) => v._id === id);

  // Determine if user has saved watch progress for this video
  const historyEntry = 
    continueWatching.find((entry) => entry.video?._id === id) ||
    recentActivity.find((entry) => entry.video?._id === id);
  const savedProgress = historyEntry ? historyEntry.progressSeconds : 0;

  // Lock screen orientation to LANDSCAPE on mount, unlock on unmount
  useEffect(() => {
    async function lock() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setOrientationLocked(true);
      } catch (err) {
        console.error('Error locking orientation:', err);
      }
    }
    lock();

    return () => {
      async function unlock() {
        try {
          await ScreenOrientation.unlockAsync();
        } catch (err) {
          console.error('Error unlocking orientation:', err);
        }
      }
      unlock();
    };
  }, []);

  // Initialize expo-video player
  const player = useVideoPlayer(video?.streamUrl || '', (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
    
    // Seek to saved progress once player is initialized and stream is ready
    if (savedProgress > 0) {
      console.log(`Resuming watch progress: seeking to ${savedProgress}s`);
      videoPlayer.seekTo(savedProgress);
    }
  });

  // Heartbeat sync: send playback progress updates every 5 seconds to database
  useEffect(() => {
    if (!player || !id || !video) return;

    const interval = setInterval(async () => {
      try {
        const currentTime = player.currentTime;
        // Only sync if video is playing and time is valid
        if (currentTime > 0 && currentTime < video.duration) {
          console.log(`Syncing progress heartbeat: ${Math.floor(currentTime)}s / ${video.duration}s`);
          await api.post('/user/history', {
            videoId: id,
            progressSeconds: Math.floor(currentTime)
          });
        }
      } catch (error) {
        console.error('Heartbeat progress sync failed:', error);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [player, id, video]);

  if (loadingVideos || loadingDashboard || !orientationLocked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Configuring stream...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Streaming link not found.</Text>
        <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
          <Text style={styles.backButtonInlineText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.videoView}
        allowsFullscreen={false} // Fullscreen handled via native container layout
        allowsPictureInPicture
      />
      
      {/* Floating Back Control Overlay */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20
  },
  backButtonInline: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4
  },
  backButtonInlineText: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  videoView: {
    width: '100%',
    height: '100%'
  },
  floatingBackButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
});
