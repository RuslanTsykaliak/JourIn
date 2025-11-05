
// app/components/coach/AnalyticsDisplay.tsx
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalyticsDisplayProps {
  analysis: string;
}

export default function AnalyticsDisplay({ analysis }: AnalyticsDisplayProps) {
  return (
    <div className="prose prose-invert mt-6 p-4 bg-gray-700 rounded-lg">
      <ReactMarkdown>{analysis}</ReactMarkdown>
    </div>
  );
}
