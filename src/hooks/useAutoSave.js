import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useDebounce from "./useDebounce";

const DRAFT_KEY = "ielts-current-draft";

export default function useAutoSave(promptId, answer) {
  const debouncedAnswer = useDebounce(answer, 2000);
  const [lastSaved, setLastSaved] = useState(null);
  const prevSaved = useRef("");

  // Derive status from comparing answer vs debouncedAnswer
  const status = useMemo(() => {
    if (!answer || !answer.trim()) return "idle";
    if (answer !== debouncedAnswer) return "saving";
    return "saved";
  }, [answer, debouncedAnswer]);

  // Save draft when debouncedAnswer settles
  useEffect(() => {
    if (!debouncedAnswer || !debouncedAnswer.trim()) {
      // Clear draft when empty
      if (prevSaved.current) {
        localStorage.removeItem(DRAFT_KEY);
        prevSaved.current = "";
      }
      return;
    }

    if (debouncedAnswer === prevSaved.current) return;
    prevSaved.current = debouncedAnswer;

    const draft = {
      promptId,
      answer: debouncedAnswer,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
     
    setLastSaved(new Date());
  }, [debouncedAnswer, promptId]);

  // Clear draft manually
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    prevSaved.current = "";
    setLastSaved(null);
  }, []);

  // Check if a draft exists (for recovery on mount)
  const getDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  return {
    status,
    lastSaved,
    clearDraft,
    getDraft,
  };
}
