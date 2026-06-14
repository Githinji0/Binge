import React, { useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useVideos } from '../../hooks/useVideos';
import { useDashboardData } from '../../hooks/useDashboardData';
import HeroBanner from '../../components/HeroBanner';
import ContinueWatchingCard from '../../components/ContinueWatchingCard';
import VideoShelf from '../../components/VideoShelf';
import LoadingScreen from '../../components/LoadingScreen';
import COLORS from '../../constants/colors';

export default function HomeScreen() {
  const { videos, loading: loadingVideos, refetch: refetchVideos } = useVideos();
  const {
    favorites,
    continueWatching,
    loading: loadingDashboard,
    refetch: refetchDashboard
  } = useDashboardData();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchVideos(), refetchDashboard()]);
    setRefreshing(false);
  };

  const loading = loadingVideos || loadingDashboard;

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  // Choose the first video in the catalog as the featured hero banner
  const featuredVideo = videos.length > 0 ? videos[0] : null;

  // Filter video list into categories
  const animationVideos = videos.filter((v) => v.category.toLowerCase() === 'animation');
  const fantasyVideos = videos.filter((v) => v.category.toLowerCase() === 'fantasy');
  const scifiVideos = videos.filter((v) => v.category.toLowerCase() === 'sci-fi');
  const promoVideos = videos.filter((v) => v.category.toLowerCase() === 'promo');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Large Netflix-Style Banner */}
        <HeroBanner video={featuredVideo} />

        {/* Continue Watching Section */}
        {continueWatching && continueWatching.length > 0 && (
          <View style={styles.continueSection}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            <FlatList
              data={continueWatching}
              keyExtractor={(item) => item.video?._id || Math.random().toString()}
              renderItem={({ item }) => <ContinueWatchingCard entry={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueList}
            />
          </View>
        )}

        {/* Dynamic Category Shelves */}
        <VideoShelf title="My List (Favorites)" videos={favorites} />
        <VideoShelf title="Sci-Fi & CGI" videos={scifiVideos} />
        <VideoShelf title="Fantasy & Anime" videos={fantasyVideos} />
        <VideoShelf title="Animation Masterpieces" videos={animationVideos} />
        <VideoShelf title="Promotional Reels" videos={promoVideos} />
        
        {/* Footer padding */}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: 40
  },
  continueSection: {
    marginVertical: 12
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.3
  },
  continueList: {
    paddingLeft: 16,
    paddingRight: 4
  },
  footerSpacing: {
    height: 40
  }
});
