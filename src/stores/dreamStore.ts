import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { interpretDream } from '@/services/openai';
import type { Dream, DreamCreateInput, DreamUpdateInput, InterpretationResult } from '@/types/dream';

// ── Normaliser le retour Supabase (array ou objet) ─────────────
function normalizeDream(raw: any): Dream {
  const interp = Array.isArray(raw.interpretation)
    ? raw.interpretation[0] ?? null
    : raw.interpretation ?? null;
  return { ...raw, interpretation: interp } as Dream;
}

interface DreamState {
  dreams: Dream[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // Actions
  fetchDreams: () => Promise<void>;
  createDream: (input: DreamCreateInput) => Promise<Dream>;
  updateDream: (id: string, input: DreamUpdateInput) => Promise<void>;
  deleteDream: (id: string) => Promise<void>;
  interpretDream: (dreamId: string) => Promise<InterpretationResult>;
  getDreamById: (id: string) => Dream | undefined;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  isLoading: false,
  isCreating: false,
  error: null,

  // ── Fetch tous les rêves de l'utilisateur ──────────────────
  fetchDreams: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*, interpretation:interpretations(*)')
        .is('deleted_at', null)           // ← soft-delete
        .order('dream_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) { throw error; }
      set({ dreams: (data ?? []).map(normalizeDream), isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Créer un rêve ──────────────────────────────────────────
  createDream: async (input: DreamCreateInput): Promise<Dream> => {
    set({ isCreating: true, error: null }); console.log("[Dream] content recu:", input?.content);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dreams')
        .insert({
          user_id:       user.id,
          title:         input.title ?? null,
          content:       input.content,
          dream_date:    input.dream_date,
          sleep_quality: input.sleep_quality ?? null,
          emotions:      input.emotions ?? [],
          tags:          input.tags ?? [],
          is_lucid:      input.is_lucid ?? false,
          is_recurring:  input.is_recurring ?? false,
          is_public:     input.is_public ?? false,
        })
        .select('*, interpretation:interpretations(*)')
        .single();

      if (error) { throw error; }

      const newDream = normalizeDream(data);

      // Mise à jour optimiste du store
      set(state => ({ dreams: [newDream, ...state.dreams], isCreating: false }));

      // Mettre à jour le streak — une seule fois, en fire & forget
      supabase.rpc('update_streak', { p_user_id: user.id }).then(({ error: rpcError }) => {
        if (rpcError) {
          // Non bloquant — ne pas alerter l'utilisateur pour ça
        }
      });

      return newDream;
    } catch (err: any) {
      set({ isCreating: false, error: err.message });
      throw err;
    }
  },

  // ── Mettre à jour un rêve ──────────────────────────────────
  updateDream: async (id: string, input: DreamUpdateInput): Promise<void> => {
    // Mise à jour optimiste immédiate
    set(state => ({
      dreams: state.dreams.map(d => d.id === id ? { ...d, ...input } : d),
    }));

    const { error } = await supabase
      .from('dreams')
      .update({
        ...(input.title         !== undefined && { title:         input.title         }),
        ...(input.content       !== undefined && { content:       input.content       }),
        ...(input.sleep_quality !== undefined && { sleep_quality: input.sleep_quality }),
        ...(input.emotions      !== undefined && { emotions:      input.emotions      }),
        ...(input.tags          !== undefined && { tags:          input.tags          }),
        ...(input.is_lucid      !== undefined && { is_lucid:      input.is_lucid      }),
        ...(input.is_recurring  !== undefined && { is_recurring:  input.is_recurring  }),
        ...(input.is_public     !== undefined && { is_public:     input.is_public     }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      // Rollback — refetch
      get().fetchDreams();
      throw error;
    }
  },

  // ── Supprimer un rêve (soft delete) ───────────────────────
  deleteDream: async (id: string): Promise<void> => {
    // Retirer immédiatement de la liste (optimistic)
    const previous = get().dreams;
    set(state => ({ dreams: state.dreams.filter(d => d.id !== id) }));

    const { error } = await supabase
      .from('dreams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      // Rollback
      set({ dreams: previous });
      throw error;
    }
  },

  // ── Interpréter un rêve ────────────────────────────────────
  interpretDream: async (dreamId: string): Promise<InterpretationResult> => {
    const result = await interpretDream(dreamId);

    if (result.interpretation) {
      // Injecter l'interprétation dans le store sans refetch
      set(state => ({
        dreams: state.dreams.map(d =>
          d.id === dreamId
            ? { ...d, interpretation: result.interpretation! }
            : d
        ),
      }));
    }

    return result;
  },

  getDreamById: (id: string) => get().dreams.find(d => d.id === id),
  refresh:      () => get().fetchDreams(),
  clearError:   () => set({ error: null }),
}));
