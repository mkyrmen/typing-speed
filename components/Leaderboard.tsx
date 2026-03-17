"use client";

import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Row = {
  id?: string;
  username: string;
  wpm: number;
  accuracy: number;
  story_title: string;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("leaderboards")
          .select("username,wpm,accuracy,story_title")
          .order("wpm", { ascending: false })
          .limit(10);

        if (!alive) return;
        if (error) {
          setError(error.message);
          setRows([]);
        } else {
          setRows((data ?? []) as Row[]);
        }
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load leaderboard");
        setRows([]);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mt-10 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-[0.22em] uppercase opacity-70">Leaderboard</h3>
        {loading && <span className="text-xs opacity-50">Loading…</span>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.22em] opacity-60">
            <tr className="border-b border-[color:var(--foreground)]/10">
              <th className="px-5 py-3 w-16">Rank</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3 w-24">WPM</th>
              <th className="px-5 py-3 w-28">Accuracy</th>
              <th className="px-5 py-3">Story</th>
            </tr>
          </thead>
          <tbody className="text-[color:var(--foreground)]/85">
            {!loading && error && (
              <tr>
                <td className="px-5 py-4 text-xs text-red-400" colSpan={5}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-xs opacity-60" colSpan={5}>
                  No scores yet. Be the first.
                </td>
              </tr>
            )}

            {rows.map((r, i) => {
              const rank = i + 1;
              const round1 = (n: number) => Math.round(n * 10) / 10;
              return (
                <tr key={`${r.username}-${rank}-${r.story_title}`} className="border-b border-[color:var(--foreground)]/8 last:border-b-0">
                  <td className="px-5 py-4">
                    {rank === 1 ? (
                      <span className="inline-flex items-center gap-2 font-semibold text-[color:var(--caret)]">
                        <Crown className="h-4 w-4" />
                        1
                      </span>
                    ) : (
                      <span className="tabular-nums opacity-70">{rank}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium">{r.username}</td>
                  <td className="px-5 py-4 tabular-nums">{round1(r.wpm)}</td>
                  <td className="px-5 py-4 tabular-nums">{round1(r.accuracy)}%</td>
                  <td className="px-5 py-4 opacity-75">{r.story_title}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

