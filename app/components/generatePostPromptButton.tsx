// app/components/generatePostPromptButton.tsx
"use client";

import React from "react";

interface GeneratePostPromptButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function GeneratePostPromptButton({ onClick, disabled }: GeneratePostPromptButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Generate Post Prompt
    </button>
  );
}
