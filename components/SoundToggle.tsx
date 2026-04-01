"use client";

import React from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SoundToggle() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      onClick={toggleSound}
      role="switch"
      aria-checked={soundEnabled}
      aria-label={soundEnabled ? "Disable typing sound" : "Enable typing sound"}
      className="relative inline-flex items-center h-8 w-16 rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--caret)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] backdrop-blur"
    >
      <span className="absolute left-2 text-xs z-0 opacity-80" aria-hidden="true">🔇</span>
      <span className="absolute right-2 text-xs z-0 opacity-80" aria-hidden="true">🔊</span>
      <span
        className={`inline-block w-6 h-6 transform rounded-full bg-[color:var(--caret)] shadow-md transition-transform duration-300 z-10 ${
          soundEnabled ? "translate-x-[34px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

