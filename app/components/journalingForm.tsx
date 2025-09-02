// app/components/journalingForm.tsx
"use client";

import React, { useState } from "react";
import { JournalEntries, CustomTitles } from "../types";
import EditableTitle from './editableTitle';

interface JournalingFormProps {
  journalEntries: JournalEntries;
  onJournalEntriesChange: (entries: JournalEntries) => void;
  customTitles: CustomTitles;
  onCustomTitleChange: (key: string, value: string) => void;
  additionalFields: string[];
  setAdditionalFields: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function JournalingForm({
  journalEntries,
  onJournalEntriesChange,
  customTitles,
  onCustomTitleChange,
  additionalFields,
  setAdditionalFields,
}: JournalingFormProps) {
  const [hoveredField, setHoveredField] = useState<string | null>(null);

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
  };

  const handleRemoveField = (fieldName: string) => {
    setAdditionalFields(additionalFields.filter((field) => field !== fieldName));
    const newEntries = { ...journalEntries };
    delete newEntries[fieldName];
    delete newEntries[`${fieldName}_title`];
    onJournalEntriesChange(newEntries);
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

        {additionalFields.map((fieldName) => (
          <div key={fieldName} className="relative p-4 border border-gray-600 rounded-md">
            <input
              type="text"
              name={`${fieldName}_title`}
              placeholder="Title"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100 mb-2"
              value={(journalEntries[`${fieldName}_title`] as string) || ''}
              onChange={handleChange}
            />
            <textarea
              name={fieldName}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Description"
              value={(journalEntries[fieldName] as string) || ''}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => handleRemoveField(fieldName)}
              className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-red-600 rounded-full text-white hover:bg-red-500 flex items-center justify-center"
            >
              -
            </button>
          </div>
        ))}
      </form>
    </div>
  );
}
