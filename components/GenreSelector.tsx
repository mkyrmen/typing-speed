"use client";

import { useTypingStore } from "@/store/useTypingStore";
import { GENRES, GenreName } from "@/constants/stories";

export default function GenreSelector() {
  const genre = useTypingStore((s) => s.genre);
  const setGenre = useTypingStore((s) => s.setGenre);

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Select genre">
      {GENRES.map((g) => {
        const isActive = genre === g.name;
        return (
          <button
            key={g.name}
            type="button"
            onClick={() => setGenre(g.name as GenreName)}
            aria-pressed={isActive}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium tracking-wide border transition-all duration-200",
              isActive
                ? "border-[color:var(--caret)] text-[color:var(--caret)] bg-[color:var(--caret)]/10"
                : "border-[color:var(--foreground)]/15 text-[color:var(--foreground)]/40 hover:text-[color:var(--foreground)]/70 hover:border-[color:var(--foreground)]/30 bg-transparent",
            ].join(" ")}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}
