// app/components/rewardPopup.tsx
"use client";

import React, { useEffect, useState } from 'react';

interface RewardPopupProps {
  streak: number;
  onClose: () => void;
}

const MILESTONES = [
  { days: 7, message: "Congratulations! You've hit a 7-day streak. Keep up the great work!" },
  { days: 30, message: "Amazing! A 30-day streak. You're building incredible habits!" },
  { days: 365, message: "Unbelievable! A full-year streak. Your dedication is truly inspiring!" },
  { days: 1461, message: "Four years! You are a legend. Your consistency is unmatched!" }, // 365 * 4 + 1 (for leap year)
];

export default function RewardPopup({ streak, onClose }: RewardPopupProps) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const milestone = MILESTONES.find(m => m.days === streak);
    if (milestone) {
      setMessage(milestone.message);
    } else {
      setMessage(null);
    }
  }, [streak]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center text-gray-100 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold mb-4">Streak Milestone Achieved</h2>
        <p className="mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Awesome
        </button>
      </div>
    </div>
  );
}
