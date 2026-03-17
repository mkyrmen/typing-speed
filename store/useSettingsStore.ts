import { create } from "zustand";

type SettingsState = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
};

const STORAGE_KEY = "typing.soundEnabled";

function readInitialSoundEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  soundEnabled: true,
  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(enabled));
      } catch {
        // ignore
      }
    }
  },
  toggleSound: () =>
    set((s) => {
      const next = !s.soundEnabled;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
      }
      return { soundEnabled: next };
    }),
}));

// Hydrate once on client without requiring a Provider.
if (typeof window !== "undefined") {
  useSettingsStore.setState({ soundEnabled: readInitialSoundEnabled() });
}

