import { useState, useMemo } from "react";
import useDebounce from "./useDebounce";
import checkGrammar from "../utils/grammarChecker";

const STORAGE_KEY = "ielts-grammar-check-enabled";

export default function useGrammarCheck(answer) {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "false",
  );

  const debouncedAnswer = useDebounce(answer, 1500);
  const wordCount = debouncedAnswer?.trim()
    ? debouncedAnswer.trim().split(/\s+/).length
    : 0;

  const errors = useMemo(() => {
    if (!enabled) return [];
    if (wordCount < 20) return [];
    return checkGrammar(debouncedAnswer);
  }, [enabled, debouncedAnswer, wordCount]);

  const isChecking = enabled && answer !== debouncedAnswer && wordCount >= 20;

  const toggleEnabled = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return {
    errors,
    isChecking,
    enabled,
    toggleEnabled,
  };
}
