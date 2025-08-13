// app/components/promptInputSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import JournalingForm from './journalingForm';
import GeneratePostPromptButton from './generatePostPromptButton';
import { JournalEntries, UserGoal, CustomTitles } from '../types';
import { debounce } from '../utils/debounce';
import { generatePromptText } from '../utils/generatePromptText';

const DEFAULT_CUSTOM_TITLES: CustomTitles = {
  whatWentWell: 'What went well today?',
  whatILearned: 'What did I learn today?',
  whatWouldDoDifferently: 'What would I do differently?',
  nextStep: 'What’s my next step?',
};

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
  const [customTitles, setCustomTitles] = useState<CustomTitles>(DEFAULT_CUSTOM_TITLES);

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

    const savedCustomTitles = localStorage.getItem('jourin_custom_titles');
    if (savedCustomTitles) {
      try {
        setCustomTitles(JSON.parse(savedCustomTitles));
      } catch (e) {
        console.error("Failed to parse saved custom titles from localStorage", e);
        localStorage.removeItem('jourin_custom_titles');
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

  // --- Local Storage: Debounced Save Custom Titles ---
  const debouncedSaveCustomTitles = useCallback(
    debounce((titles: CustomTitles) => {
      localStorage.setItem('jourin_custom_titles', JSON.stringify(titles));
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSaveDraft(journalEntries);
  }, [journalEntries, debouncedSaveDraft]);

  useEffect(() => {
    debouncedSaveUserGoal(userGoal);
  }, [userGoal, debouncedSaveUserGoal]);

  useEffect(() => {
    debouncedSaveCustomTitles(customTitles);
  }, [customTitles, debouncedSaveCustomTitles]);

  const handleJournalEntriesChange = (entries: JournalEntries) => {
    setJournalEntries(entries);
  };

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGoal(e.target.value);
  };

  const handleCustomTitleChange = (key: keyof CustomTitles, value: string) => {
    setCustomTitles(prevTitles => ({
      ...prevTitles,
      [key]: value,
    }));
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
        customTitles={customTitles}
        onCustomTitleChange={handleCustomTitleChange}
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