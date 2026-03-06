import { useState, useCallback } from 'react';
import { interpretDream } from '@/services/openai';
import { useDreamStore } from '@/stores/dreamStore';
import type { DreamInterpretation } from '@/types/dream';

interface UseInterpretationReturn {
  isLoading: boolean;
  error: string | null;
  quotaExceeded: boolean;
  quotaInfo: { used: number; limit: number; resets_at: string } | null;
  interpret: (dreamId: string) => Promise<DreamInterpretation | null>;
  clearError: () => void;
}

export function useInterpretation(): UseInterpretationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ used: number; limit: number; resets_at: string } | null>(null);

  const interpret = useCallback(async (dreamId: string): Promise<DreamInterpretation | null> => {
    setIsLoading(true);
    setError(null);
    setQuotaExceeded(false);

    try {
      const result = await interpretDream(dreamId);

      if (result.quotaExceeded) {
        setQuotaExceeded(true);
        setQuotaInfo(result.quota ?? null);
        return null;
      }

      if (result.error) {
        setError(result.error);
        return null;
      }

      if (result.interpretation) {
        // Mettre à jour le store local avec l'interprétation
        useDreamStore.setState((state) => ({
          dreams: state.dreams.map((d) =>
            d.id === dreamId
              ? { ...d, interpretation: result.interpretation }
              : d
          ),
        }));
        return result.interpretation;
      }

      return null;
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    quotaExceeded,
    quotaInfo,
    interpret,
    clearError: () => { setError(null); setQuotaExceeded(false); },
  };
}
