
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
      className="w-full flex justify-center rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Generate Post
    </button>
  );
}
