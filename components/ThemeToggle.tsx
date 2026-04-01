"use client";

import React from "react";
import { Paintbrush } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const THEMES: Array<{ id: ThemeMode; label: string; swatch: string }> = [
  { id: "carbon", label: "Carbon", swatch: "bg-neutral-600" },
  { id: "frost", label: "Frost", swatch: "bg-cyan-400" },
  { id: "cyber", label: "Cyber", swatch: "bg-green-500" },
  { id: "serene", label: "Serene", swatch: "bg-teal-400" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Paintbrush className="h-4 w-4 opacity-60" />
      <div className="flex items-center rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 p-1 backdrop-blur" role="radiogroup" aria-label="Theme selection">
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(t.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wide transition",
                "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--foreground)]/30",
                active
                  ? "bg-[color:var(--foreground)]/10 text-[color:var(--foreground)]"
                  : "text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]",
              ].join(" ")}
            >
              <span className={`w-2 h-2 rounded-full ${t.swatch} shadow-sm`} aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

