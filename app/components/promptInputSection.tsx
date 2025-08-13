// app/components/promptInputSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import JournalingForm from './journalingForm';
import GeneratePostPromptButton from './generatePostPromptButton';
import { JournalEntries, UserGoal } from '../types';
import { debounce } from '../utils/debounce';
import { generatePromptText } from '../utils/generatePromptText';

interface PromptInputSectionProps {
  onPromptGenerated: (prompt: string, entry: JournalEntries) => void;
}

export default function PromptInputSection({ onPromptGenerated }: PromptInputSectionProps) {
  const [journalEntries, setJournalEntries] = useState<JournalEntries>({
    whatWentWell: '',
    whatILearned: '',
    whatWouldDoDifferently: '',
    nextStep: '',
  });

  const [userGoal, setUserGoal] = useState<string>('');

  // --- Local Storage: Load on Mount ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('jourin_current_draft');
    if (savedDraft) {
      try {
        setJournalEntries(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse saved draft from localStorage", e);
        localStorage.removeItem('jourin_current_draft');
      }
    }

    const savedGoal = localStorage.getItem('jourin_user_goal');
    if (savedGoal) {
      try {
        setUserGoal(JSON.parse(savedGoal));
      } catch (e) {
        console.error("Failed to parse saved user goal from localStorage", e);
        localStorage.removeItem('jourin_user_goal');
      }
    }
  }, []);

  // --- Local Storage: Debounced Save Current Draft ---
  const debouncedSaveDraft = useCallback(
    debounce((entries: JournalEntries) => {
      localStorage.setItem('jourin_current_draft', JSON.stringify(entries));
    }, 500),
    []
  );

  // --- Local Storage: Debounced Save User Goal ---
  const debouncedSaveUserGoal = useCallback(
    debounce((goal: string) => {
      localStorage.setItem('jourin_user_goal', JSON.stringify(goal));
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSaveDraft(journalEntries);
  }, [journalEntries, debouncedSaveDraft]);

  useEffect(() => {
    debouncedSaveUserGoal(userGoal);
  }, [userGoal, debouncedSaveUserGoal]);

  const handleJournalEntriesChange = (entries: JournalEntries) => {
    setJournalEntries(entries);
  };

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGoal(e.target.value);
  };

  const handleGenerateClick = () => {
    const prompt = generatePromptText({ ...journalEntries, userGoal });
    onPromptGenerated(prompt, { ...journalEntries, userGoal });

    // Clear current draft after submission, but keep user goal
    setJournalEntries({
      whatWentWell: '',
      whatILearned: '',
      whatWouldDoDifferently: '',
      nextStep: '',
    });
    localStorage.removeItem('jourin_current_draft');
  };

  return (
    <>
      <JournalingForm
        journalEntries={journalEntries}
        onJournalEntriesChange={handleJournalEntriesChange}
      />

      <div className="mt-8">
        <div className="mt-4 space-y-4">
          <div>
            <input
              type="text"
              id="userGoal"
              name="userGoal"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Your goal (e.g., 'Find a fullstack position', 'Build followers for my tech blog')"
              value={userGoal}
              onChange={handleGoalInputChange}
            />
          </div>
        </div>
      </div>

      <GeneratePostPromptButton
        journalEntries={journalEntries}
        onGeneratePrompt={handleGenerateClick}
      />
    </>
  );
}