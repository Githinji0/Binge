export interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  streamUrl: string;
  duration: number; // in seconds
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchHistoryEntry {
  video: Video;
  timestamp: string;
  progressSeconds: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  favorites: Video[] | string[];
  watchHistory: WatchHistoryEntry[];
}

export interface Playlist {
  _id: string;
  name: string;
  createdBy: string; // User ID
  videos: Video[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  favorites: Video[];
  continueWatching: WatchHistoryEntry[];
  recentActivity: WatchHistoryEntry[];
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}
