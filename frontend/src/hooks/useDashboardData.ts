import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { DashboardData } from '../types';

/**
 * Hook to query authenticated user's mobile dashboard aggregates.
 */
export const useDashboardData = () => {
  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardData>('/user/dashboard');
      return response.data;
    }
  });

  return {
    favorites: data?.favorites || [],
    continueWatching: data?.continueWatching || [],
    recentActivity: data?.recentActivity || [],
    loading,
    error,
    refetch
  };
};

export default useDashboardData;
