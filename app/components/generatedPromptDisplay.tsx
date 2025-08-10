// app/components/generatedPromptDisplay.tsx
"use client";

import React from 'react';

interface GeneratedPromptDisplayProps {
  prompt: string;
  onCopy: () => void;
  copySuccess: string;
}

export default function GeneratedPromptDisplay({ prompt, onCopy, copySuccess }: GeneratedPromptDisplayProps) {
  return (
    <div className="mt-8 p-4 bg-gray-700 rounded-md shadow-md text-left">
      <h2 className="text-lg font-medium text-gray-100">Generated Prompt:</h2>
      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-300">{prompt}</pre>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onCopy}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Copy Prompt
        </button>
        {copySuccess && (
          <span className="ml-3 text-sm text-green-400 font-medium">
            {copySuccess}
          </span>
        )}
      </div>
    </div>
  );
}