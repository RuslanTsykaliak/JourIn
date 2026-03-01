
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
      className="w-full flex justify-center py-3 xs:py-4 sm:py-5 md:py-6 px-4 xs:px-5 sm:px-6 md:px-7 border border-transparent rounded-md shadow-sm text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Generate Post
    </button>
  );
}
