import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Playlist, Video } from '../../types';
import { useVideos } from '../../hooks/useVideos';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export default function PlaylistsScreen() {
  const queryClient = useQueryClient();
  const { videos } = useVideos();
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [addVideoModalVisible, setAddVideoModalVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  // Fetch user playlists
  const { data: playlists = [], isLoading: loadingPlaylists, refetch: refetchPlaylists } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await api.get<Playlist[]>('/user/playlists');
      return response.data;
    }
  });

  // Create Playlist Mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post<Playlist>('/user/playlists', { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setNewPlaylistName('');
      setCreateModalVisible(false);
    }
  });

  // Delete Playlist Mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      await api.delete(`/user/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    }
  });

  // Add Video to Playlist Mutation
  const addVideoMutation = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      const response = await api.post<Playlist>(`/user/playlists/${playlistId}/videos`, { videoId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setAddVideoModalVisible(false);
      setSelectedPlaylist(null);
    }
  });

  // Remove Video from Playlist Mutation
  const removeVideoMutation = useMutation({
    mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
      await api.delete(`/user/playlists/${playlistId}/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    }
  });

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylistMutation.mutate(newPlaylistName.trim());
    }
  };

  const handleAddVideo = (videoId: string) => {
    if (selectedPlaylist) {
      addVideoMutation.mutate({ playlistId: selectedPlaylist._id, videoId });
    }
  };

  const toggleExpand = (playlistId: string) => {
    setExpandedPlaylistId(expandedPlaylistId === playlistId ? null : playlistId);
  };

  if (loadingPlaylists) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <EmptyState
          icon="list"
          title="No playlists found"
          message="Create custom lists to group your favorite movies, animations, and trailers."
          actionLabel="Create Playlist"
          onAction={() => setCreateModalVisible(true)}
        />
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetchPlaylists}
          refreshing={false}
          renderItem={({ item: playlist }) => {
            const isExpanded = expandedPlaylistId === playlist._id;
            return (
              <View style={styles.playlistCard}>
                <TouchableOpacity
                  onPress={() => toggleExpand(playlist._id)}
                  style={styles.playlistHeader}
                  activeOpacity={0.8}
                >
                  <View style={styles.playlistHeaderLeft}>
                    <Ionicons name="film" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                    <View>
                      <Text style={styles.playlistName}>{playlist.name}</Text>
                      <Text style={styles.playlistCount}>
                        {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? 'video' : 'videos'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.playlistBody}>
                    {playlist.videos && playlist.videos.length > 0 ? (
                      playlist.videos.map((video) => (
                        <View key={video._id} style={styles.videoItem}>
                          <TouchableOpacity
                            onPress={() => router.push(`/player/${video._id}`)}
                            style={styles.videoDetails}
                            activeOpacity={0.8}
                          >
                            <Image source={{ uri: video.thumbnail }} style={styles.videoThumb} />
                            <View style={styles.videoMeta}>
                              <Text style={styles.videoTitle} numberOfLines={1}>
                                {video.title}
                              </Text>
                              <Text style={styles.videoCat}>{video.category}</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              removeVideoMutation.mutate({
                                playlistId: playlist._id,
                                videoId: video._id
                              })
                            }
                            style={styles.removeVideoBtn}
                          >
                            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyPlaylistText}>No videos in this playlist yet.</Text>
                    )}

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPlaylist(playlist);
                          setAddVideoModalVisible(true);
                        }}
                        style={[styles.actionBtn, styles.addVideoBtn]}
                      >
                        <Ionicons name="add-circle-outline" size={16} color={COLORS.secondary} />
                        <Text style={styles.actionBtnText}>Add Video</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deletePlaylistMutation.mutate(playlist._id)}
                        style={[styles.actionBtn, styles.deletePlaylistBtn]}
                      >
                        <Ionicons name="trash" size={16} color={COLORS.error} />
                        <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Delete List</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist Name"
              placeholderTextColor={COLORS.muted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePlaylist}
                style={[styles.modalBtn, styles.confirmBtn]}
              >
                <Text style={styles.confirmBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Video Modal */}
      <Modal
        visible={addVideoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddVideoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.addVideoModal]}>
            <Text style={styles.modalTitle}>Select Video to Add</Text>
            <ScrollView style={styles.videoSelectorScroll}>
              {videos
                .filter((v) => !selectedPlaylist?.videos?.some((pv) => pv._id === v._id))
                .map((video) => (
                  <TouchableOpacity
                    key={video._id}
                    onPress={() => handleAddVideo(video._id)}
                    style={styles.selectorItem}
                  >
                    <Image source={{ uri: video.thumbnail }} style={styles.selectorThumb} />
                    <View style={styles.selectorMeta}>
                      <Text style={styles.selectorTitle} numberOfLines={1}>
                        {video.title}
                      </Text>
                      <Text style={styles.selectorCat}>{video.category}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              {videos.filter((v) => !selectedPlaylist?.videos?.some((pv) => pv._id === v._id))
                .length === 0 && (
                <Text style={styles.noVideosToAddText}>All catalog videos already added.</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setAddVideoModalVisible(false)}
              style={styles.closeSelectorBtn}
            >
              <Text style={styles.closeSelectorText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    padding: 4
  },
  listContent: {
    padding: 16
  },
  playlistCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomColor: COLORS.border
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  playlistHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playlistName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold'
  },
  playlistCount: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2
  },
  playlistBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    backgroundColor: '#111'
  },
  videoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  videoThumb: {
    width: 60,
    height: 40,
    borderRadius: 4,
    backgroundColor: COLORS.surface
  },
  videoMeta: {
    marginLeft: 10,
    flex: 1
  },
  videoTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  videoCat: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2
  },
  removeVideoBtn: {
    padding: 6
  },
  emptyPlaylistText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 0.48
  },
  addVideoBtn: {
    backgroundColor: COLORS.accent
  },
  deletePlaylistBtn: {
    backgroundColor: 'rgba(231, 29, 54, 0.1)'
  },
  actionBtnText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 320
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    fontSize: 15,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalBtn: {
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    flex: 0.46
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.muted
  },
  cancelBtnText: {
    color: COLORS.muted,
    fontWeight: '600'
  },
  confirmBtn: {
    backgroundColor: COLORS.primary
  },
  confirmBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  addVideoModal: {
    maxHeight: '80%',
    maxWidth: 360
  },
  videoSelectorScroll: {
    marginVertical: 10,
    maxHeight: 320
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  selectorThumb: {
    width: 60,
    height: 40,
    borderRadius: 4,
    backgroundColor: COLORS.surface
  },
  selectorMeta: {
    marginLeft: 12,
    flex: 1,
    marginRight: 10
  },
  selectorTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  selectorCat: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2
  },
  noVideosToAddText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 20
  },
  closeSelectorBtn: {
    backgroundColor: COLORS.inputBackground,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10
  },
  closeSelectorText: {
    color: COLORS.text,
    fontWeight: 'bold'
  }
});
