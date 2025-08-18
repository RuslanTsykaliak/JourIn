// app/components/generatePostPromptButton.tsx
"use client";

import React from "react";
import { generatePromptText } from "../utils/generatePromptText";
import { JournalEntries } from '../types';
import { updateStreak } from '../lib/fireUp'; // Import updateStreak

interface GeneratePostPromptButtonProps {
  journalEntries: JournalEntries;
  onGeneratePrompt: (prompt: string) => void;
}

export default function GeneratePostPromptButton({ journalEntries, onGeneratePrompt }: GeneratePostPromptButtonProps) {
  const handleGenerateClick = () => {
    try {
      const prompt = generatePromptText(journalEntries);
      onGeneratePrompt(prompt); // Let parent handle streak update
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };



  return (
    <button
      type="button"
      onClick={handleGenerateClick}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Generate Post Prompt
    </button>
  );
}