import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Video } from '../types';

/**
 * Hook to query public video catalog.
 */
export const useVideos = () => {
  const {
    data: videos = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await api.get<Video[]>('/videos');
      return response.data;
    }
  });

  return {
    videos,
    loading,
    error,
    refetch
  };
};

export default useVideos;
