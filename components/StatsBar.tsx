"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";

function useFlashOnChange<T>(value: T, durationMs = 220) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (Object.is(prev.current, value)) return;
    prev.current = value;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), durationMs);
    return () => window.clearTimeout(t);
  }, [value, durationMs]);

  return flash;
}

function Stat({ label, value, flash, icon }: { label: string; value: React.ReactNode; flash: boolean; icon: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2">
      <span className="text-[9px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.28em] uppercase opacity-40 flex items-center gap-1">
        <span className="text-xs sm:text-sm pb-[1px] sm:pb-[2px]">{icon}</span>
        {label}
      </span>
      <span
        className={[
          "tabular-nums font-bold text-base sm:text-xl transition-all duration-200",
          flash ? "opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]" : "opacity-75",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const wpm = useTypingStore((s) => s.wpm);
  const accuracy = useTypingStore((s) => s.accuracy);
  const timeLeft = useTypingStore((s) => s.timeLeft);

  const wpmFlash = useFlashOnChange(wpm);
  const accFlash = useFlashOnChange(Math.round(accuracy * 10) / 10);
  const timeFlash = useFlashOnChange(timeLeft);

  return (
    <div className="fixed top-20 md:top-6 left-1/2 z-50 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-fit" aria-label="Typing Statistics">
      <div className="grid grid-cols-3 divide-x divide-[color:var(--foreground)]/12 items-center rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 px-2 py-1.5 sm:px-5 sm:py-2 backdrop-blur shadow-sm [&>div]:justify-center">
        <Stat label="WPM" value={wpm} flash={wpmFlash} icon="⚡" />
        <Stat label="ACC" value={`${Math.round(accuracy)}%`} flash={accFlash} icon="🎯" />
        <Stat label="TIME" value={`${timeLeft}s`} flash={timeFlash} icon="⏱" />
      </div>
    </div>
  );
}

