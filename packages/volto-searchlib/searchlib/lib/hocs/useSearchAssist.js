import { atom, useAtom } from 'jotai';

export const isQuestionAtom = atom(false);
export const isLoadingSummaryAtom = atom(false);
export const isLoadingAnswerAtom = atom(false);

/**
 * Hook for managing Search Assist toggle state globally.
 * Persists preference to localStorage.
 */
export const useSearchAssist = () => {
  const [isQuestion, setIsQuestion] = useAtom(isQuestionAtom);
  const [isLoadingSummary, setIsLoadingSummary] = useAtom(isLoadingSummaryAtom);
  const [isLoadingAnswer, setIsLoadingAnswer] = useAtom(isLoadingAnswerAtom);

  const reset = () => {
    setIsQuestion(false);
    setIsLoadingSummary(false);
    setIsLoadingAnswer(false);
  };

  return {
    isQuestion,
    isLoadingSummary,
    isLoadingAnswer,
    setIsQuestion,
    setIsLoadingSummary,
    setIsLoadingAnswer,
    reset,
  };
};

export default useSearchAssist;
