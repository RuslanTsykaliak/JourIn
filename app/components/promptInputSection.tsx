// app/components/promptInputSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import JournalingForm from './journalingForm';
import GeneratePostPromptButton from './generatePostPromptButton';
import { JournalEntries } from '../types';
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
  }, []);

  // --- Local Storage: Debounced Save Current Draft ---
  const debouncedSaveDraft = useCallback(
    debounce((entries: JournalEntries) => {
      localStorage.setItem('jourin_current_draft', JSON.stringify(entries));
    }, 500),
    [] // No dependencies needed here as the function is inline
  );

  useEffect(() => {
    // This effect runs when journalEntries changes, triggering the debounced save
    debouncedSaveDraft(journalEntries);
  }, [journalEntries, debouncedSaveDraft]); // debouncedSaveDraft is a stable reference from useCallback

  const handleJournalEntriesChange = (entries: JournalEntries) => {
    setJournalEntries(entries);
  };

  const handleGenerateClick = () => {
    const prompt = generatePromptText(journalEntries);
    onPromptGenerated(prompt, journalEntries);

    // Clear current draft after submission
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
      <GeneratePostPromptButton
        journalEntries={journalEntries}
        onGeneratePrompt={handleGenerateClick}
      />
    </>
  );
}