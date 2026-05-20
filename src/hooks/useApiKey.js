import { useState, useEffect } from "react";

const SYSTEM_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function useApiKey() {
  const [keyMode, setKeyMode] = useState(
    () => localStorage.getItem("key_mode") || "system",
  );
  const [personalKey, setPersonalKey] = useState(
    () => localStorage.getItem("personal_key") || "",
  );
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("key_mode", keyMode);
  }, [keyMode]);

  useEffect(() => {
    if (personalKey) localStorage.setItem("personal_key", personalKey);
  }, [personalKey]);

  const activeKey =
    keyMode === "personal" && personalKey ? personalKey : SYSTEM_KEY;

  const changeKey = (mode, key) => {
    setKeyMode(mode);
    if (key) setPersonalKey(key);
    setShowKeyModal(false);
  };

  const keyLabel =
    keyMode === "system"
      ? SYSTEM_KEY
        ? "System key"
        : "Change key"
      : personalKey
        ? "Personal key"
        : "Change key";

  return {
    keyMode,
    personalKey,
    activeKey,
    showKeyModal,
    setShowKeyModal,
    changeKey,
    keyLabel,
    systemKeyConfigured: !!SYSTEM_KEY,
  };
}
