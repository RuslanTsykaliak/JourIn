// app/components/promptInputSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import JournalingForm from './journalingForm';
import GeneratePostPromptButton from './generatePostPromptButton';
import PromptTemplateEditor from './promptTemplateEditor';
import { JournalEntries, CustomTitles } from '../types';
import { debounce } from '../utils/debounce';
import { generatePromptText } from '../utils/generatePromptText';
import { defaultPromptTemplate } from '../lib/promptTemplate';

const DEFAULT_CUSTOM_TITLES: CustomTitles = {
  whatWentWell: 'What went well today?',
  whatILearned: 'What did I learn today?',
  whatWouldDoDifferently: 'What would I do differently?',
  nextStep: 'What’s my next step?',
};

interface PromptInputSectionProps {
  onPromptGenerated: (prompt: string, entry: JournalEntries, customTitles: CustomTitles) => void;
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
  const [promptTemplate, setPromptTemplate] = useState<string>(defaultPromptTemplate);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<string[]>([]);

  // --- Local Storage: Load on Mount ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('jourin_current_draft');
    if (savedDraft) {
      try {
        setJournalEntries(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse saved draft from localStorage", e);
      }
    }

    const savedGoal = localStorage.getItem('jourin_user_goal');
    if (savedGoal) {
      try {
        setUserGoal(JSON.parse(savedGoal));
      } catch (e) {
        console.error("Failed to parse saved user goal from localStorage", e);
      }
    }

    const savedCustomTitles = localStorage.getItem('jourin_custom_titles');
    if (savedCustomTitles) {
      try {
        setCustomTitles(JSON.parse(savedCustomTitles));
      } catch (e) {
        console.error("Failed to parse saved custom titles from localStorage", e);
      }
    }

    const savedTemplate = localStorage.getItem('jourin_prompt_template');
    if (savedTemplate) {
      setPromptTemplate(savedTemplate);
    }

    const savedAdditionalFields = localStorage.getItem('jourin_additional_fields');
    if (savedAdditionalFields) {
      try {
        setAdditionalFields(JSON.parse(savedAdditionalFields));
      } catch (e) {
        console.error("Failed to parse saved additional fields from localStorage", e);
      }
    }

    setHasHydrated(true);
  }, []);

  // --- Local Storage: Debounced Save ---
  const debouncedSaveDraft = debounce((entries: JournalEntries) => {
    localStorage.setItem('jourin_current_draft', JSON.stringify(entries));
  }, 500);

  const debouncedSaveUserGoal = debounce((goal: string) => {
    localStorage.setItem('jourin_user_goal', JSON.stringify(goal));
  }, 500);

  const saveCustomTitles = useCallback(
    (titles: CustomTitles) => {
      localStorage.setItem('jourin_custom_titles', JSON.stringify(titles));
    },
    []
  );

  const saveAdditionalFields = useCallback(
    (fields: string[]) => {
      localStorage.setItem('jourin_additional_fields', JSON.stringify(fields));
    },
    []
  );

  useEffect(() => {
    if (hasHydrated) {
      saveCustomTitles(customTitles);
    }
  }, [customTitles, saveCustomTitles, hasHydrated]);

  useEffect(() => {
    if (hasHydrated) {
      saveAdditionalFields(additionalFields);
    }
  }, [additionalFields, saveAdditionalFields, hasHydrated]);

  // --- Event Handlers ---
  const handleJournalEntriesChange = (entries: JournalEntries) => {
    setJournalEntries(entries);
    debouncedSaveDraft(entries);
  };

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = e.target.value;
    setUserGoal(newGoal);
    debouncedSaveUserGoal(newGoal);
  };

  const handleCustomTitleChange = (key: string, value: string) => {
    setCustomTitles(prevTitles => ({ ...prevTitles, [key]: value }));
  };

  const handleSaveTemplate = (newTemplate: string) => {
    setPromptTemplate(newTemplate);
    localStorage.setItem('jourin_prompt_template', newTemplate);
    setIsEditorOpen(false);
  };

  const handleGenerateClick = () => {
    for (const key in journalEntries) {
      if (Object.prototype.hasOwnProperty.call(journalEntries, key)) {
        const entryValue = journalEntries[key];
        if (typeof entryValue === 'string' && entryValue.trim() !== '' && (!customTitles[key] || customTitles[key].trim() === '')) {
          alert(`Please provide a title for the entry with content: "${entryValue}"`);
          return;
        }
      }
    }

    try {
      const prompt = generatePromptText(
        { ...journalEntries, userGoal },
        customTitles,
        promptTemplate
      );
      onPromptGenerated(prompt, { ...journalEntries, userGoal }, customTitles);

      const clearedAdditionalEntries = additionalFields.reduce((acc, fieldName) => {
        acc[fieldName] = '';
        return acc;
      }, {} as { [key: string]: string });

      const newEntries = {
        ...journalEntries,
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        ...clearedAdditionalEntries,
      };

      localStorage.setItem('jourin_current_draft', JSON.stringify(newEntries));
      setJournalEntries(newEntries);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  const isGenerationDisabled = Object.values(journalEntries).every(
    (value) => typeof value === 'string' && value.trim() === ''
  );

  return (
    <>
      <JournalingForm
        journalEntries={journalEntries}
        onJournalEntriesChange={handleJournalEntriesChange}
        customTitles={customTitles}
        onCustomTitleChange={handleCustomTitleChange}
        additionalFields={additionalFields}
        setAdditionalFields={setAdditionalFields}
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

      <div className="mt-6 flex flex-col items-center">
        <GeneratePostPromptButton
          onClick={handleGenerateClick}
          disabled={isGenerationDisabled}
        />
        <button
          onClick={() => setIsEditorOpen(true)}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Customize Prompt
        </button>
      </div>

      {isEditorOpen && (
        <PromptTemplateEditor
          initialTemplate={promptTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </>
  );
}