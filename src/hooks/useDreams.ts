import { useEffect, useCallback } from 'react';
import { useDreamStore } from '@/stores/dreamStore';
import { useAuth } from '@/hooks/useAuth';
import type { DreamCreateInput } from '@/types/dream';

export function useDreams() {
  const { user } = useAuth();
  const store = useDreamStore();

  // Chargement auto au montage
  useEffect(() => {
    if (user?.id) {
      store.fetchDreams(user.id);
    }
  }, [user?.id]);

  const createDream = useCallback(
    async (input: DreamCreateInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      return store.createDream(input);
    },
    [user?.id]
  );

  const refresh = useCallback(() => {
    if (user?.id) store.fetchDreams(user.id, true);
  }, [user?.id]);

  return {
    dreams: store.dreams,
    isLoading: store.isLoading,
    isCreating: store.isCreating,
    isDeleting: store.isDeleting,
    error: store.error,
    createDream,
    updateDream: store.updateDream,
    deleteDream: store.deleteDream,
    getDreamById: store.getDreamById,
    refresh,
    clearError: store.clearError,
  };
}
