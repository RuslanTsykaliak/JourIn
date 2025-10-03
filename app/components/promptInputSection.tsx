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

import { useSession } from 'next-auth/react';
import GeneratePostPromptButtonDB from './generatePostPromptButtonDB';
import GeneratedPostDisplayDB from './generatedPostDisplayDB';

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
  const { status } = useSession();
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
  const [generatedPostDB, setGeneratedPostDB] = useState<string>("");

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

  // // Add back any additional fields that are still active and have content
  // additionalFields.forEach(fieldName => {
  //   if (journalEntries[fieldName] && (journalEntries[fieldName] as string).trim() !== '') {
  //     newEntries[fieldName] = journalEntries[fieldName];
  //     // Only add the title if the field itself has content
  //     const titleKey = `${fieldName}_title`;
  //     if (journalEntries[titleKey]) { // Check if title exists
  //       newEntries[titleKey] = journalEntries[titleKey];
  //     }
  //   }
  // });


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

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    const defaultKeys = new Set(['whatWentWell', 'whatILearned', 'whatWouldDoDifferently', 'nextStep']);

    for (const key in journalEntries) {
      if (Object.prototype.hasOwnProperty.call(journalEntries, key)) {
        const entryValue = journalEntries[key];

        // Skip if the key is a title for an additional field (e.g., 'customField_0_title')
        if (key.endsWith('_title')) {
          continue;
        }

        // Get the title for the current entry
        let entryTitle = '';
        if (defaultKeys.has(key)) {
          entryTitle = customTitles[key] || '';
        } else {
          // This is an additional field, its title is stored in journalEntries itself
          entryTitle = (journalEntries[`${key}_title`] as string) || '';
        }

        if (typeof entryValue === 'string' && entryValue.trim() !== '' && entryTitle.trim() === '') {
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

      // Create a comprehensive customTitles object
      const allCustomTitles: CustomTitles = { ...customTitles };

      // Add custom field titles to the customTitles object
      for (const key in journalEntries) {
        if (Object.prototype.hasOwnProperty.call(journalEntries, key) && key.endsWith('_title')) {
          // Add the title field itself to customTitles
          allCustomTitles[key] = journalEntries[key] as string;

          // ALSO make sure the custom field value is in customTitles
          const baseKey = key.replace(/_title$/, '');
          if (journalEntries[baseKey]) {
            allCustomTitles[baseKey] = journalEntries[baseKey] as string;
          }
        }
      }

      console.log('Final allCustomTitles being passed to onPromptGenerated:', allCustomTitles);

      onPromptGenerated(prompt, { ...journalEntries, userGoal }, allCustomTitles);

      const newEntries: JournalEntries = {
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
      };

      additionalFields.forEach(field => {
        const titleKey = `${field}_title`;
        if (journalEntries[titleKey]) {
          newEntries[titleKey] = journalEntries[titleKey];
        }
      });

      localStorage.setItem('jourin_current_draft', JSON.stringify(newEntries));
      setJournalEntries(newEntries);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleGeneratePostDB = async () => {
    try {
      const response = await fetch('/api/generate/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal: userGoal,
          promptTemplate: promptTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate post');
      }

      const { post } = await response.json();
      setGeneratedPostDB(post);
    } catch (error) {
      console.error('Error generating post:', error);
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
            <textarea
              id="userGoal"
              name="userGoal"
              rows={3} // Or any other number of rows you prefer
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
        {status === 'authenticated' && (
          <div className="mt-4 w-full">
            <GeneratePostPromptButtonDB
              onClick={handleGeneratePostDB}
              disabled={isGenerationDisabled}
            />
          </div>
        )}
        <button
          onClick={() => setIsEditorOpen(true)}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Customize Prompt
        </button>
      </div>

      {generatedPostDB && <GeneratedPostDisplayDB post={generatedPostDB} />}

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