"use client";

import React, { useEffect } from "react";
import { typingSound } from "@/lib/audio/typingSound";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AudioPreload() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  useEffect(() => {
    if (!soundEnabled) return;
    // Pre-decode once to avoid first-keystroke stutter.
    void typingSound.preload();

    // Unlock on first user gesture (autoplay policies).
    const unlock = () => void typingSound.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [soundEnabled]);

  return null;
}

