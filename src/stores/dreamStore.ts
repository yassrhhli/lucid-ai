import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Dream, DreamCreateInput } from '@/types/dream';

interface DreamState {
  dreams: Dream[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  hasLoadedOnce: boolean;
  fetchDreams: (userId: string, forceRefresh?: boolean) => Promise<void>;
  createDream: (userId: string, input: DreamCreateInput) => Promise<Dream>;
  updateDream: (dreamId: string, updates: Partial<DreamCreateInput>) => Promise<void>;
  deleteDream: (dreamId: string) => Promise<void>;
  getDreamById: (dreamId: string) => Dream | undefined;
  clearError: () => void;
  reset: () => void;
}

// Supabase retourne interpretation comme tableau — on prend le premier élément
function normalizeDream(raw: any): Dream {
  const interp = raw.interpretation;
  return {
    ...raw,
    interpretation: Array.isArray(interp) ? (interp[0] ?? null) : (interp ?? null),
  };
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  error: null,
  hasLoadedOnce: false,

  fetchDreams: async (userId: string, forceRefresh = false) => {
    const { hasLoadedOnce, isLoading } = get();
    if (isLoading) return;
    if (hasLoadedOnce && !forceRefresh) return;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select(`*, interpretation:interpretations(*)`)
        .eq('user_id', userId)
        .order('dream_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ dreams: (data ?? []).map(normalizeDream), hasLoadedOnce: true });
    } catch (error: any) {
      console.error('[DreamStore] fetchDreams:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createDream: async (userId: string, input: DreamCreateInput): Promise<Dream> => {
    set({ isCreating: true, error: null });
    try {
      const { data, error } = await supabase
        .from('dreams')
        .insert({ ...input, user_id: userId })
        .select(`*, interpretation:interpretations(*)`)
        .single();

      if (error) throw error;
      const newDream = normalizeDream(data);
      set((state) => ({ dreams: [newDream, ...state.dreams] }));
      await supabase.rpc('update_streak', { p_user_id: userId });
      await supabase.from('profiles').update({ last_dream_at: new Date().toISOString() }).eq('id', userId);
      await supabase.from('profiles').update({ last_dream_at: new Date().toISOString() }).eq('id', userId);
      return newDream;
    } catch (error: any) {
      console.error('[DreamStore] createDream:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  updateDream: async (dreamId: string, updates: Partial<DreamCreateInput>) => {
    set((state) => ({
      dreams: state.dreams.map((d) => d.id === dreamId ? { ...d, ...updates } : d),
    }));
    try {
      const { error } = await supabase.from('dreams').update(updates).eq('id', dreamId);
      if (error) { set({ error: error.message }); throw error; }
    } catch (error: any) { throw error; }
  },

  deleteDream: async (dreamId: string) => {
    set({ isDeleting: true });
    const previousDreams = get().dreams;
    set((state) => ({ dreams: state.dreams.filter((d) => d.id !== dreamId) }));
    try {
      const { error } = await supabase.from('dreams').delete().eq('id', dreamId);
      if (error) { set({ dreams: previousDreams, error: error.message }); throw error; }
    } catch (error: any) { throw error; }
    finally { set({ isDeleting: false }); }
  },

  getDreamById: (dreamId: string) => get().dreams.find((d) => d.id === dreamId),
  clearError: () => set({ error: null }),
  reset: () => set({ dreams: [], isLoading: false, isCreating: false, error: null, hasLoadedOnce: false }),
}));
