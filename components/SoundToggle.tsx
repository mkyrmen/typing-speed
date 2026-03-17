"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SoundToggle() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  const Icon = soundEnabled ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 px-3 py-2 text-xs font-medium text-[color:var(--foreground)]/70 hover:text-[color:var(--foreground)] transition backdrop-blur"
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Disable typing sound" : "Enable typing sound"}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{soundEnabled ? "Sound" : "Muted"}</span>
    </button>
  );
}

