
// app/components/generatePostPromptButtonDB.tsx
"use client";

import React from "react";

interface GeneratePostPromptButtonDBProps {
  onClick: () => void;
  disabled: boolean;
}

export default function GeneratePostPromptButtonDB({ onClick, disabled }: GeneratePostPromptButtonDBProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Generate Post
    </button>
  );
}
