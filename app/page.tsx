// app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Header from './components/header';
import PromptInputSection from './components/promptInputSection';
import GeneratedPromptDisplay from './components/generatedPromptDisplay';
import JournalHistorySection from './components/journalHistorySection'; // Commented out
import RewardPopup from './components/rewardPopup';
import { getStreakData, updateStreak } from './lib/fireUp';
import { CustomTitles, JournalEntries, JournalEntryWithTimestamp } from './types';

export default function Home() {
  const { status } = useSession();
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copyPromptSuccess, setCopyPromptSuccess] = useState<string>('');
  const [newEntryForHistory, setNewEntryForHistory] = useState<JournalEntryWithTimestamp | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  const MILESTONES = useMemo(() => [7, 30, 365, 1461], []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // The user is not authenticated, you can keep them on this page
      // or redirect them to a login page if you prefer.
      // For now, we'll show the login/register buttons.
    } else if (status === 'authenticated') {
      const checkStreakAndShowPopup = () => {
        const data = getStreakData();
        setCurrentStreak(data.currentStreak);

        if (MILESTONES.includes(data.currentStreak)) {
          const lastShownMilestone = localStorage.getItem('jourin_last_shown_milestone');
          if (lastShownMilestone !== `${data.currentStreak}-${data.lastPostDate}`) {
            setShowRewardPopup(true);
            localStorage.setItem('jourin_last_shown_milestone', `${data.currentStreak}-${data.lastPostDate}`);
          }
        }
      };

      checkStreakAndShowPopup();

      window.addEventListener('storage', checkStreakAndShowPopup);

      return () => {
        window.removeEventListener('storage', checkStreakAndShowPopup);
      };
    }
  }, [status, MILESTONES]);

  const handlePromptGenerated = async (prompt: string, entry: JournalEntries, customTitles: CustomTitles) => {
    setGeneratedPrompt(prompt);
    setCopyPromptSuccess('');
    setNewEntryForHistory({ ...entry, timestamp: Date.now(), customTitles });

    await updateStreak(); // ◆ Wait for streak update

    const data = getStreakData();
    setCurrentStreak(data.currentStreak);

    window.dispatchEvent(new Event("streakUpdated"));

    if (MILESTONES.includes(data.currentStreak)) {
      const lastShownMilestone = localStorage.getItem('jourin_last_shown_milestone');
      if (lastShownMilestone !== `${data.currentStreak}-${data.lastPostDate}`) {
        setShowRewardPopup(true);
        localStorage.setItem('jourin_last_shown_milestone', `${data.currentStreak}-${data.lastPostDate}`);
      }
    }
    setNewEntryForHistory(null); // Reset after processing
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

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }



  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-gray-800 p-8 rounded-lg shadow-lg text-gray-100">
        <Header />
        <PromptInputSection onPromptGenerated={handlePromptGenerated} />
        {generatedPrompt && (
          <GeneratedPromptDisplay
            prompt={generatedPrompt}
            onCopy={copyGeneratedPromptToClipboard}
            copySuccess={copyPromptSuccess}
          />
        )}
        <JournalHistorySection newEntryToHistory={newEntryForHistory} /> {/* Commented out */}
      </div>

      {showRewardPopup && (
        <RewardPopup
          streak={currentStreak}
          onClose={() => setShowRewardPopup(false)}
        />
      )}
    </div>
  );
}