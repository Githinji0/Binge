import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import api from '../../services/api';
import { Playlist } from '../../types';
import COLORS from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { favorites, recentActivity } = useDashboardData();

  // Fetch playlists to show count
  const { data: playlists = [] } = useQuery<Playlist[]>({
    queryKey: ['playlists']
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{recentActivity.length}</Text>
          <Text style={styles.statLabel}>Watched</Text>
        </View>
        <View style={[styles.statBox, styles.statDivider]}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{playlists.length}</Text>
          <Text style={styles.statLabel}>Playlists</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings-outline" size={22} color={COLORS.muted} style={{ marginRight: 15 }} />
            <Text style={styles.menuItemText}>Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.muted} style={{ marginRight: 15 }} />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={22} color={COLORS.muted} style={{ marginRight: 15 }} />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.menuItem, styles.logoutItem]}
          activeOpacity={0.8}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} style={{ marginRight: 15 }} />
            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    color: COLORS.secondary,
    fontSize: 36,
    fontWeight: 'bold'
  },
  username: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold'
  },
  email: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 4
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderRightWidth: 1,
    borderRightColor: COLORS.border
  },
  statNumber: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold'
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuItemText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500'
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10
  }
});
