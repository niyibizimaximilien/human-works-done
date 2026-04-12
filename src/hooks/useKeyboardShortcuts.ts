import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Register keyboard shortcuts. Keys are lowercase letters or "Escape".
 * Only fires when no input/textarea is focused.
 */
const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key === "Escape" ? "Escape" : e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
