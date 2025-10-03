
// app/components/journalingFormDb.tsx
"use client";

import React, { useState } from "react";
import { JournalEntries, CustomTitles } from "../types";
import EditableTitle from './editableTitle';
import { useReward } from "../hooks/useReward";
import GeneratePostPromptButtonDB from "./generatePostPromptButtonDB";
import GeneratedPostDisplayDB from "./generatedPostDisplayDB";

interface JournalingFormDbProps {
  journalEntries: JournalEntries;
  onJournalEntriesChange: (entries: JournalEntries) => void;
  customTitles: CustomTitles;
  onCustomTitleChange: (key: string, value: string) => void;
  additionalFields: string[];
  setAdditionalFields: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function JournalingFormDb({
  journalEntries,
  onJournalEntriesChange,
  customTitles,
  onCustomTitleChange,
  additionalFields,
  setAdditionalFields,
}: JournalingFormDbProps) {
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [titleErrors, setTitleErrors] = useState<{ [key: string]: string }>({});
  const { showReward } = useReward();
  const [generatedPostDB, setGeneratedPostDB] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onJournalEntriesChange({
      ...journalEntries,
      [name]: value,
    });
  };

  const handleAddField = () => {
    const newFieldName = `customField_${additionalFields.length}`;
    setAdditionalFields([...additionalFields, newFieldName]);
    showReward("New field added!");
  };

  const handleRemoveField = (fieldName: string) => {
    setAdditionalFields(additionalFields.filter((field) => field !== fieldName));
    const newEntries = { ...journalEntries };
    delete newEntries[fieldName];
    delete newEntries[`${fieldName}_title`];
    onJournalEntriesChange(newEntries);
    showReward("Field removed!");
  };

  const handleGeneratePostDB = async () => {
    try {
      const response = await fetch('/api/generate/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal: journalEntries.userGoal,
          promptTemplate: journalEntries.promptTemplate,
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

  const renderTextarea = (name: string, placeholder: string, title: string) => {
    const isHovered = hoveredField === name;
    const hasContent = journalEntries[name] && typeof journalEntries[name] === 'string' && journalEntries[name].length > 0;

    return (
      <div
        className="relative"
        onMouseEnter={() => setHoveredField(name)}
        onMouseLeave={() => setHoveredField(null)}
      >
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 text-center">
          <EditableTitle
            initialValue={title}
            onSave={(newValue) => onCustomTitleChange(name, newValue)}
            fieldKey={name}
          />
        </label>
        <div className="mt-1">
          <textarea
            id={name}
            name={name}
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
            placeholder={placeholder}
            value={(journalEntries[name] as string) || ''}
            onChange={handleChange}
          />
        </div>
        {isHovered && !hasContent && (
          <button
            type="button"
            onClick={handleAddField}
            className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-gray-600 rounded-full text-white hover:bg-gray-500 flex items-center justify-center"
          >
            +
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <form className="space-y-6">
        {renderTextarea('whatWentWell', 'Reflect on your achievements and positive experiences...', customTitles.whatWentWell)}
        {renderTextarea('whatILearned', 'Jot down new insights, skills, or knowledge gained...', customTitles.whatILearned)}
        {renderTextarea('whatWouldDoDifferently', 'Consider areas for improvement and alternative approaches...', customTitles.whatWouldDoDifferently)}
        {renderTextarea('nextStep', 'Outline the specific actions you’ll take tomorrow or in the near future based on today’s experiences...', customTitles.nextStep)}

        {additionalFields.map((fieldName) => {
          const name = fieldName;
          const title = (journalEntries[`${fieldName}_title`] as string) || 'New Field';
          const placeholder = "Description";
          const isHovered = hoveredField === name;
          const isFocused = focusedField === name;

          return (
            <div
              key={name}
              className="relative"
              onMouseEnter={() => setHoveredField(name)}
              onMouseLeave={() => setHoveredField(null)}
            >
              <label htmlFor={name} className="block text-sm font-medium text-gray-300 text-center">
                <EditableTitle
                  initialValue={title}
                  onSave={(newValue) => {
                    setTitleErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
                    onJournalEntriesChange({ ...journalEntries, [`${name}_title`]: newValue });
                  }}
                  fieldKey={name}
                  onFocus={() => {
                    setFocusedField(name);
                    setTitleErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; }); // Clear error on focus
                  }}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Write your question"
                />
              </label>
              {titleErrors[name] && (
                <p className="text-red-500 text-xs mt-1">{titleErrors[name]}</p>
              )}
              <div className="mt-1">
                <textarea
                  id={name}
                  name={name}
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
                  placeholder={placeholder}
                  value={(journalEntries[name] as string) || ''}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(name)}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {isHovered && !isFocused && (
                <button
                  type="button"
                  onClick={() => handleRemoveField(name)}
                  className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-red-600 rounded-full text-white hover:bg-red-500 flex items-center justify-center"
                >
                  -
                </button>
              )}
            </div>
          );
        })}
      </form>
      <div className="mt-6">
        <GeneratePostPromptButtonDB
          onClick={handleGeneratePostDB}
          disabled={!journalEntries.whatWentWell && !journalEntries.whatILearned && !journalEntries.whatWouldDoDifferently && !journalEntries.nextStep}
        />
      </div>
      <GeneratedPostDisplayDB post={generatedPostDB} />
    </div>
  );
}
