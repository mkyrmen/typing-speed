"use client";

import React from "react";
import { useTypingStore } from "@/store/useTypingStore";

export default function TimerSelector() {
  const { timerDuration, setTimerDuration, status } = useTypingStore();

  const options = [15, 30, 60];

  if (status !== "idle") return null;

  return (
    <div className="flex gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
      {options.map((option) => {
        const isActive = timerDuration === option;
        return (
          <button
            key={option}
            onClick={() => setTimerDuration(option)}
            aria-label={`${option} seconds timer`}
            aria-pressed={isActive}
            className={`flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-lg font-mono transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
              isActive
                ? "bg-yellow-500 text-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105 border-2 border-yellow-500 font-bold"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border-2 border-transparent"
            }`}
          >
            {isActive && <span>✔</span>}
            <span>{option}s</span>
          </button>
        );
      })}
    </div>
  );
}
