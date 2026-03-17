"use client";

import React from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { RotateCcw } from "lucide-react";

export default function ResultsSummary() {
  const { wpm, accuracy, resetGame, status } = useTypingStore();

  if (status !== "finished") return null;

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 uppercase tracking-widest text-sm mb-2">WPM</span>
          <span className="text-7xl font-bold text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            {wpm}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 uppercase tracking-widest text-sm mb-2">Accuracy</span>
          <span className="text-7xl font-bold text-white">
            {Math.round(accuracy)}%
          </span>
        </div>
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-3 px-8 py-4 bg-gray-800 hover:bg-white hover:text-gray-900 text-white rounded-xl font-bold text-xl transition-all duration-300 group"
      >
        <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform duration-300" />
        Restart
        <span className="text-xs opacity-50 ml-2 font-normal border border-current px-1.5 py-0.5 rounded">Enter</span>
      </button>
    </div>
  );
}
