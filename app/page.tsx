// app/page.tsx
"use client";

import React, { useState } from 'react';
import Header from './components/header';
import PromptInputSection from './components/promptInputSection';
import GeneratedPromptDisplay from './components/generatedPromptDisplay';
import JournalHistorySection from './components/journalHistorySection';
import { JournalEntries, JournalEntryWithTimestamp } from './types'; // Import types

export default function Home() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copyPromptSuccess, setCopyPromptSuccess] = useState<string>('');
  const [newEntryForHistory, setNewEntryForHistory] = useState<JournalEntryWithTimestamp | null>(null);

  const handlePromptGenerated = (prompt: string, entry: JournalEntries) => {
    setGeneratedPrompt(prompt);
    setCopyPromptSuccess(''); // Clear previous copy success message
    setNewEntryForHistory({ ...entry, timestamp: Date.now() }); // Prepare entry for history
  };

  const copyGeneratedPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyPromptSuccess('Copied!');
      setTimeout(() => setCopyPromptSuccess(''), 2000);
    } catch (err) {
      setCopyPromptSuccess('Failed to copy!');
      console.error('Failed to copy prompt: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-gray-800 p-8 rounded-lg shadow-lg text-gray-100"> {/* Changed to dark mode colors */}
        <Header />
        <PromptInputSection onPromptGenerated={handlePromptGenerated} />
        {generatedPrompt && (
          <GeneratedPromptDisplay
            prompt={generatedPrompt}
            onCopy={copyGeneratedPromptToClipboard}
            copySuccess={copyPromptSuccess}
          />
        )}
        <JournalHistorySection newEntryToHistory={newEntryForHistory} />
      </div>
    </div>
  );
}
