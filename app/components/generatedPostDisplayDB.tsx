
// app/components/generatedPostDisplayDB.tsx
"use client";

import React from "react";

interface GeneratedPostDisplayDBProps {
  post: string;
}

export default function GeneratedPostDisplayDB({ post }: GeneratedPostDisplayDBProps) {
  if (!post) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">Generated Post</h3>
      <div className="mt-2 p-4 bg-gray-100 rounded-md">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post}</p>
      </div>
    </div>
  );
}
