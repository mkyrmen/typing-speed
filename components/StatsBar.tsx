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

function Stat({ label, value, flash }: { label: string; value: React.ReactNode; flash: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] tracking-[0.28em] uppercase opacity-40">{label}</span>
      <span
        className={[
          "tabular-nums font-semibold transition-all duration-200",
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
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-6 rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 px-5 py-2 backdrop-blur">
        <Stat label="WPM" value={wpm} flash={wpmFlash} />
        <div className="h-4 w-px bg-[color:var(--foreground)]/12" />
        <Stat label="ACC" value={`${Math.round(accuracy)}%`} flash={accFlash} />
        <div className="h-4 w-px bg-[color:var(--foreground)]/12" />
        <Stat label="TIME" value={`${timeLeft}s`} flash={timeFlash} />
      </div>
    </div>
  );
}

