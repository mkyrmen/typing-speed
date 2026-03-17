"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, SendHorizontal } from "lucide-react";
import { useTypingStore } from "@/store/useTypingStore";

export default function TestComplete() {
  const isFinished = useTypingStore((s) => s.isFinished);
  const wpm = useTypingStore((s) => s.wpm);
  const accuracy = useTypingStore((s) => s.accuracy);
  const storyTitle = useTypingStore((s) => s.currentStoryTitle);
  const saveScore = useTypingStore((s) => s.saveScore);
  const resetToMenu = useTypingStore((s) => s.resetToMenu);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const rounded = useMemo(() => {
    const round1 = (n: number) => Math.round(n * 10) / 10;
    return { wpm: round1(wpm), accuracy: round1(accuracy) };
  }, [wpm, accuracy]);

  if (!isFinished) return null;

  const onSubmit = async () => {
    if (status === "saving") return;
    setStatus("saving");
    setError(null);
    try {
      await saveScore(name);
      setStatus("saved");
      resetToMenu();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to submit score");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle2 className="h-6 w-6 text-[color:var(--caret)]" />
        <h2 className="text-2xl font-semibold tracking-tight">Test Complete</h2>
      </div>

      <div className="mb-10 text-center">
        <div className="text-6xl font-semibold tabular-nums text-[color:var(--caret)]">{rounded.wpm}</div>
        <div className="mt-2 text-sm opacity-70 tabular-nums">
          {rounded.accuracy}% accuracy · {storyTitle ?? "Unknown story"}
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nickname"
          className="w-full rounded-xl border border-[color:var(--foreground)]/12 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--caret)]/60"
          maxLength={24}
          autoFocus
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={status === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-[color:var(--caret)] text-black hover:opacity-90 transition disabled:opacity-60"
        >
          <SendHorizontal className="h-4 w-4" />
          {status === "saving" ? "Submitting..." : "Submit Score"}
        </button>

        {status === "error" && error && <div className="text-xs text-red-400">{error}</div>}
        <div className="text-[11px] opacity-50">Submitting returns you to the menu automatically.</div>
      </div>
    </div>
  );
}

