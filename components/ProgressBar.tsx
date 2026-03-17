"use client";

import React from "react";
import { useTypingStore } from "@/store/useTypingStore";

export default function ProgressBar() {
  const { timeLeft, timerDuration, status } = useTypingStore();

  if (status === "idle" || status === "finished") return <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-4" />;

  const percentage = (timeLeft / timerDuration) * 100;

  return (
    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-4 shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(234,179,8,0.5)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
