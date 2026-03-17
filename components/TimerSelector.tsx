"use client";

import React from "react";
import { useTypingStore } from "@/store/useTypingStore";

export default function TimerSelector() {
  const { timerDuration, setTimerDuration, status } = useTypingStore();

  const options = [15, 30, 60];

  if (status !== "idle") return null;

  return (
    <div className="flex gap-4 justify-center mb-8">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setTimerDuration(option)}
          className={`px-4 py-2 rounded-lg text-lg font-mono transition-all duration-200 ${
            timerDuration === option
              ? "bg-yellow-500 text-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
              : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {option}s
        </button>
      ))}
    </div>
  );
}
