// app/components/promptInputSection.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';

import JournalingForm from './journalingForm';
import TimeJournalingSection from './timeJournalingSection';

import GeneratePostPromptButton from './generatePostPromptButton';
import PromptTemplateEditor from './promptTemplateEditor';
import { JournalEntries, CustomTitles } from '../types';
import { debounce } from '../utils/debounce';
import { generatePromptText } from '../utils/generatePromptText';
import { defaultPromptTemplate } from '../lib/promptTemplate';

import GeneratePostPromptButtonDB from './generatePostPromptButtonDB';
import GeneratedPostDisplayDB from './generatedPostDisplayDB';

const DEFAULT_CUSTOM_TITLES: CustomTitles = {
  whatWentWell: 'What went well today?',
  whatILearned: 'What did I learn today?',
  whatWouldDoDifferently: 'What would I do differently?',
  nextStep: 'What’s my next step?',
  timeJournaling: 'Time Journaling',
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
    timeJournaling: '',
  });

  const [userGoal, setUserGoal] = useState<string>('');
  const [customTitles, setCustomTitles] = useState<CustomTitles>(DEFAULT_CUSTOM_TITLES);
  const [promptTemplate, setPromptTemplate] = useState<string>(defaultPromptTemplate);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<string[]>([]);
  const [generatedPostDB, setGeneratedPostDB] = useState<string>("");

  // --- Data Source: Load on Mount ---
  useEffect(() => {
    const loadData = async () => {
      let titlesForSeed: CustomTitles = {};
      if (status === 'authenticated') {
        // Load from database for authenticated users
        try {
          const response = await fetch('/api/custom-titles');
          if (response.ok) {
            const data = await response.json();
            if (data.customTitles) {
              // Merge with DEFAULT_CUSTOM_TITLES to ensure all default keys have titles
              titlesForSeed = { ...DEFAULT_CUSTOM_TITLES, ...data.customTitles };
              setCustomTitles(titlesForSeed);
            }
            if (data.additionalFields && data.additionalFields.length > 0) {
              setAdditionalFields(data.additionalFields);
            }
          }
        } catch (error) {
          console.error('Failed to load custom titles from database:', error);
        }
      } else {
        // Load from localStorage for guest users
        const savedCustomTitles = localStorage.getItem('jourin_custom_titles');
        if (savedCustomTitles) {
          try {
            // Merge with DEFAULT_CUSTOM_TITLES to ensure all default keys have titles
            titlesForSeed = { ...DEFAULT_CUSTOM_TITLES, ...JSON.parse(savedCustomTitles) };
            setCustomTitles(titlesForSeed);
          } catch (e) {
            console.error("Failed to parse saved custom titles from localStorage", e);
          }
        }

        const savedAdditionalFields = localStorage.getItem('jourin_additional_fields');
        if (savedAdditionalFields) {
          try {
            setAdditionalFields(JSON.parse(savedAdditionalFields));
          } catch (e) {
            console.error("Failed to parse saved additional fields from localStorage", e);
          }
        }
      }

      // Load journal entries and goal from localStorage (always from localStorage)
      let draftEntries: JournalEntries = {
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        timeJournaling: '',
      };
      const savedDraft = localStorage.getItem('jourin_current_draft');
      if (savedDraft) {
        try {
          draftEntries = JSON.parse(savedDraft);
        } catch (e) {
          console.error("Failed to parse saved draft from localStorage", e);
        }
      }

      // Seed custom field titles from customTitles (DB for auth users, localStorage for guests)
      // so fields created on another device/browser still render their titles.
      Object.keys(titlesForSeed).forEach(key => {
        if (key.endsWith('_title') && typeof titlesForSeed[key] === 'string') {
          draftEntries[key] = titlesForSeed[key] as string;
        }
      });
      setJournalEntries(draftEntries);

      const savedGoal = localStorage.getItem('jourin_user_goal');
      if (savedGoal) {
        try {
          setUserGoal(JSON.parse(savedGoal));
        } catch (e) {
          console.error("Failed to parse saved user goal from localStorage", e);
        }
      }

      const savedTemplate = localStorage.getItem('jourin_prompt_template');
      if (savedTemplate) {
        setPromptTemplate(savedTemplate);
      }

      fieldsLoadedRef.current = true;
      setHasHydrated(true);
    };

    loadData();
  }, [status]);

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

  // --- Database: Debounced Save for Authenticated Users ---
  // Keep the latest titles/fields/status in a ref so the single debounced
  // request always sends the most recent state and pending saves are cancelled.
  const dbSaveRef = useRef({ titles: customTitles, fields: additionalFields, status });
  const fieldsLoadedRef = useRef(false);
  useEffect(() => {
    dbSaveRef.current = { titles: customTitles, fields: additionalFields, status };
  });

  const debouncedSaveToDatabase = useMemo(
    () =>
      debounce(async () => {
        const { titles, fields, status: currentStatus } = dbSaveRef.current;
        if (currentStatus !== 'authenticated') {
          return;
        }
        try {
          const response = await fetch('/api/custom-titles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customTitles: titles,
              additionalFields: fields,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save custom titles to database');
          }
        } catch (error) {
          console.error('Error saving custom titles to database:', error);
        }
      }, 500),
    []
  );

  const saveCustomTitles = useCallback(
    (titles: CustomTitles) => {
      if (status === 'authenticated') {
        debouncedSaveToDatabase();
      } else {
        localStorage.setItem('jourin_custom_titles', JSON.stringify(titles));
      }
    },
    [status, debouncedSaveToDatabase]
  );

  const saveAdditionalFields = useCallback(
    (fields: string[]) => {
      if (status === 'authenticated') {
        debouncedSaveToDatabase();
      } else {
        localStorage.setItem('jourin_additional_fields', JSON.stringify(fields));
      }
    },
    [status, debouncedSaveToDatabase]
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

  // Remove orphaned custom field titles when their field is deleted
  useEffect(() => {
    if (!fieldsLoadedRef.current) {
      return;
    }
    setCustomTitles(prevTitles => {
      const next = { ...prevTitles };
      let changed = false;
      Object.keys(next).forEach(key => {
        if (key.endsWith('_title') && !additionalFields.includes(key.slice(0, -'_title'.length))) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prevTitles;
    });
  }, [additionalFields]);

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
    const defaultKeys = new Set(['whatWentWell', 'whatILearned', 'whatWouldDoDifferently', 'nextStep', 'timeJournaling']);

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
          entryTitle = customTitles[key] || DEFAULT_CUSTOM_TITLES[key] || '';
        } else {
          // This is an additional field, its title is stored in journalEntries itself
          entryTitle = (journalEntries[`${key}_title`] as string) || '';
        }

        if (typeof entryValue === 'string' && entryValue.trim() !== '' && entryTitle.trim() === '') {
          alert(`Please provide a title for the entry: "${entryValue}"`);
          return false;
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

      onPromptGenerated(prompt, { ...journalEntries, userGoal }, allCustomTitles);

      const newEntries: JournalEntries = {
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        timeJournaling: '',
      };

      additionalFields.forEach(field => {
        const titleKey = `${field}_title`;
        if (journalEntries[titleKey]) {
          newEntries[titleKey] = journalEntries[titleKey];
        }
      });

      localStorage.setItem('jourin_current_draft', JSON.stringify(newEntries));
      setJournalEntries(newEntries);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      return false;
    }
  };

  const handleGeneratePostDB = async () => {
    if (!handleGenerateClick()) {
      return;
    }

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

      const newEntries: JournalEntries = {
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        timeJournaling: '',
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
      <TimeJournalingSection
        value={journalEntries.timeJournaling || ''}
        onChange={(value) => handleJournalEntriesChange({ ...journalEntries, timeJournaling: value })}
      />

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
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl border border-gray-600 rounded-md p-4 xs:p-5 sm:p-6 bg-gray-700 text-gray-100"
              placeholder="What's your goal? (e.g., 'Find a full-stack position', 'Build a following for my tech blog')"
              value={userGoal}
              onChange={handleGoalInputChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 xs:mt-7 sm:mt-8 flex flex-col items-center">
        <GeneratePostPromptButton
          onClick={handleGenerateClick}
          disabled={isGenerationDisabled}
        />
        {status === 'unauthenticated' && (
          <a href="/auth" className="mt-3 xs:mt-4 sm:mt-5 w-full">
            <button
              className="w-full flex justify-center py-2 xs:py-3 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-5 md:px-6 border border-transparent rounded-md shadow-sm text-base xs:text-lg sm:text-xl md:text-2xl font-medium text-white bg-green-700 hover:bg-green-800  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Log in to Generate a Post
            </button>
          </a>
        )}
        {status === 'authenticated' && (
          <div className="mt-3 xs:mt-4 sm:mt-5 w-full">
            <GeneratePostPromptButtonDB
              onClick={handleGeneratePostDB}
              disabled={isGenerationDisabled}
            />
          </div>
        )}
        <button
          onClick={() => setIsEditorOpen(true)}
          className="mt-2 text-base xs:text-lg sm:text-xl md:text-2xl text-blue-500 hover:underline"
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