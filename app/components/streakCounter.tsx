// app/components/streakCounter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getStreakData } from "../lib/fireUp";

interface StreakCounterProps {
  size?: string; // Optional override for icon/number size
}

export default function StreakCounter({ size = "text-xl" }: StreakCounterProps) {
  const [streak, setStreak] = useState(0);
  const [lastPostDate, setLastPostDate] = useState<string | null>(null);

  // 🔹 New: central refresh method
  const refreshStreak = () => {
    const data = getStreakData();
    setStreak(data.currentStreak);
    setLastPostDate(data.lastPostDate);
  };

  useEffect(() => {
    const data = getStreakData();
    setStreak(data.currentStreak);
    setLastPostDate(data.lastPostDate);

    // Listen for changes in localStorage to update streak dynamically
    const handleStorageChange = () => {
      const updatedData = getStreakData();
      setStreak(updatedData.currentStreak);
      setLastPostDate(updatedData.lastPostDate);
    };

    // 🔹 Listen for custom refresh events in same tab
    window.addEventListener("streakUpdated", refreshStreak);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("streakUpdated", refreshStreak);
    };
  }, []);

  const tooltipText =
    streak > 0
      ? `You're on a ${streak}-day streak! Keep it up!`
      : "Start your streak today!";

  return (
    <h1
      className="flex items-center justify-center gap-2 font-extrabold text-gray-100 text-center w-full px-2 relative group"
      style={{ fontSize: "clamp(1rem, 4vw, 2.25rem)" }} // Scales with screen size
    >
      JourIn: Journal Your Way to Impact 🔥 {streak}
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-gray-100 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        {tooltipText}
      </div>
    </h1>
  );
}
