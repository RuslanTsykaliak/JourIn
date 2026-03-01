
// app/components/generatePostButtonDB.tsx
"use client";

import React from "react";

interface GeneratePostButtonDBProps {
  onClick: () => void;
  disabled: boolean;
}

export default function GeneratePostButtonDB({ onClick, disabled }: GeneratePostButtonDBProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex justify-center py-2 xs:py-3 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-5 md:px-6 border border-transparent rounded-md shadow-sm text-base xs:text-lg sm:text-xl md:text-2xl font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Generate Post
    </button>
  );
}
