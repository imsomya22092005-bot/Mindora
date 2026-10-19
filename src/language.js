import { useCallback, useEffect, useState } from "react";

const LANGUAGE_KEY = "mindora-language";
const LANGUAGE_EVENT = "mindora-language-change";

function readLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

/**
 * Shared, reactive language preference for every Mindora route.
 * Updates the current tab immediately and keeps other tabs in sync.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState(readLanguage);

  useEffect(() => {
    const syncLanguage = () => setLanguageState(readLanguage());
    window.addEventListener(LANGUAGE_EVENT, syncLanguage);
    window.addEventListener("storage", syncLanguage);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const setLanguage = useCallback((nextValue) => {
    const next = nextValue === "hi" ? "hi" : "en";
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Keep the current page usable even if browser storage is unavailable.
    }
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(LANGUAGE_EVENT));
    }
  }, []);

  return [language, setLanguage];
}
