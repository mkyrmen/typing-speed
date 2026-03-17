"use client";

import React from "react";
import { Paintbrush } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const THEMES: Array<{ id: ThemeMode; label: string }> = [
  { id: "carbon", label: "Carbon" },
  { id: "frost", label: "Frost" },
  { id: "cyber", label: "Cyber" },
  { id: "serene", label: "Serene" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Paintbrush className="h-4 w-4 opacity-60" />
      <div className="flex items-center rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 p-1 backdrop-blur">
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={[
                "px-3 py-1 text-xs font-medium tracking-wide transition",
                "rounded-full",
                active
                  ? "bg-[color:var(--foreground)]/10 text-[color:var(--foreground)]"
                  : "text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

