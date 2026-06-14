import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { DashboardData, Video } from '../types';

interface ToggleFavResponse {
  message: string;
  favorites: Video[];
}

/**
 * Hook to handle adding/removing favorites with optimistic updates.
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation<
    ToggleFavResponse,
    Error,
    { video: Video },
    { previousDashboard?: DashboardData }
  >({
    mutationFn: async ({ video }) => {
      const response = await api.post<ToggleFavResponse>(`/user/favorite/${video._id}`);
      return response.data;
    },
    // Perform optimistic update on UI cache instantly
    onMutate: async ({ video }) => {
      // Cancel active queries to prevent overwrites
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // Save previous state as snapshot
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      // Optimistically modify local cache
      if (previousDashboard) {
        const isFavoriteAlready = previousDashboard.favorites.some((fav) => fav._id === video._id);
        const nextFavorites = isFavoriteAlready
          ? previousDashboard.favorites.filter((fav) => fav._id !== video._id)
          : [...previousDashboard.favorites, video];

        queryClient.setQueryData<DashboardData>(['dashboard'], {
          ...previousDashboard,
          favorites: nextFavorites
        });
      }

      return { previousDashboard };
    },
    // Revert cache if the server API request fails
    onError: (err, variables, context) => {
      console.error('Failed to toggle favorite, rolling back state:', err);
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
    },
    // Refresh to synchronize completely
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  return {
    toggleFavorite: (video: Video) => toggleFavoriteMutation.mutate({ video }),
    isToggling: toggleFavoriteMutation.isPending,
    error: toggleFavoriteMutation.error
  };
};

export default useFavorites;
