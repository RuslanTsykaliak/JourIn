// app/components/streakCounter.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getStreakData } from "../lib/fireUp";

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  const fetchStreakForAuthUser = useCallback(async () => {
    try {
      const response = await fetch("/api/streak");
      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
      } else {
        console.error("Failed to fetch streak for authenticated user.");
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  }, []);

  const fetchStreakForGuest = useCallback(() => {
    const data = getStreakData();
    setStreak(data.currentStreak);
  }, []);

  const refreshStreak = useCallback(() => {
    if (!mounted) return;

    if (status === "authenticated") {
      fetchStreakForAuthUser();
    } else if (status === "unauthenticated") {
      fetchStreakForGuest();
    }
  }, [mounted, status, fetchStreakForAuthUser, fetchStreakForGuest]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    refreshStreak();

    const handleStorageChange = () => {
      if (status === "unauthenticated") {
        fetchStreakForGuest();
      }
    };

    window.addEventListener("streakUpdated", refreshStreak);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("streakUpdated", refreshStreak);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [mounted, status, refreshStreak, fetchStreakForGuest]);

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