import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useDashboardData } from '../../hooks/useDashboardData';
import VideoCard from '../../components/VideoCard';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import COLORS from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 44) / 2; // Screen width minus page paddings and middle gap

export default function FavoritesScreen() {
  const { favorites, loading, refetch } = useDashboardData();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="Your List is empty"
          message="Explore titles and bookmark them to keep track of what you want to watch next."
          actionLabel="Refresh List"
          onAction={refetch}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <VideoCard video={item} width={COLUMN_WIDTH} />
            </View>
          )}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24
  },
  cardWrapper: {
    flex: 1,
    maxWidth: COLUMN_WIDTH,
    marginHorizontal: 3,
    marginBottom: 16
  }
});
