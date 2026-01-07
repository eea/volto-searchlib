import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

// Initialize from localStorage if available
const getInitialValue = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('searchAssistEnabled') === 'true';
  }
  return false;
};

export const searchAssistEnabledAtom = atom(getInitialValue());
export const isQuestionAtom = atom(false);
export const isLoadingSummaryAtom = atom(false);
export const isLoadingAnswerAtom = atom(false);

/**
 * Hook for managing Search Assist toggle state globally.
 * Persists preference to localStorage.
 */
export const useSearchAssist = () => {
  const [enabled, setEnabled] = useAtom(searchAssistEnabledAtom);
  const [isQuestion, setIsQuestion] = useAtom(isQuestionAtom);
  const [isLoadingSummary, setIsLoadingSummary] = useAtom(isLoadingSummaryAtom);
  const [isLoadingAnswer, setIsLoadingAnswer] = useAtom(isLoadingAnswerAtom);

  const reset = () => {
    setIsQuestion(false);
    setIsLoadingSummary(false);
    setIsLoadingAnswer(false);
  };

  // Persist to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchAssistEnabled', enabled.toString());
    }
  }, [enabled]);

  return {
    enabled,
    isQuestion,
    isLoadingSummary,
    isLoadingAnswer,
    setEnabled,
    setIsQuestion,
    setIsLoadingSummary,
    setIsLoadingAnswer,
    reset,
  };
};

export default useSearchAssist;
