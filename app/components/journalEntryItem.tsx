import React, { useState } from 'react';
import { JournalEntryWithTimestamp, CustomTitles } from '../types';
import { generatePromptText } from '../utils/generatePromptText';

interface JournalEntryItemProps {
  entry: JournalEntryWithTimestamp;
}

const JournalEntryItem: React.FC<JournalEntryItemProps> = ({ entry }) => {
  const [copyPastEntryPromptSuccess, setCopyPastEntryPromptSuccess] = useState<number | null>(null);
  const [copyPastEntryTextSuccess, setCopyPastEntryTextSuccess] = useState<number | null>(null);

  const defaultTitles: CustomTitles = {
    whatWentWell: "What went well today",
    whatILearned: "What I learned today",
    whatWouldDoDifferently: "What I would do differently",
    nextStep: "My next step",
  };

  // Helper function to get all fields to display, including custom fields from customTitles
  const getAllDisplayFields = () => {
    const fields: { key: string; value: string; title: string }[] = [];
    const titles = { ...defaultTitles, ...entry.customTitles };

    // Get standard fields from top level
    Object.keys(entry)
      .filter(key => {
        if (key === 'timestamp' || key === 'customTitles' || key.endsWith('_title') || key === 'userGoal') {
          return false;
        }
        const value = entry[key];
        if (typeof value === 'string') {
          return value.trim() !== '';
        }
        return !!value;
      })
      .forEach(key => {
        const title = (entry[`${key}_title`] as string) || titles[key] || key;
        const value = entry[key] as string;
        fields.push({ key, value, title });
      });

    // Get custom fields from customTitles object
    if (entry.customTitles) {
      Object.keys(entry.customTitles)
        .filter(key => {
          // Only include custom fields (like customField_0), not the standard title overrides
          return key.startsWith('customField_') && entry.customTitles[key];
        })
        .forEach(key => {
          const value = entry.customTitles[key] as string;
          const titleKey = `${key}_title`;
          const title = (entry.customTitles[titleKey] as string) || (entry[titleKey] as string) || key;

          if (value && value.trim() !== '') {
            fields.push({ key, value, title });
          }
        });
    }

    return fields;
  };

  const copyPastEntryPromptToClipboard = async () => {
    const promptToCopy = generatePromptText(entry, entry.customTitles, entry.promptTemplate);
    try {
      await navigator.clipboard.writeText(promptToCopy);
      setCopyPastEntryPromptSuccess(entry.timestamp);
      setTimeout(() => setCopyPastEntryPromptSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy past entry prompt: ', err);
    }
  };

  const copyPastEntryTextToClipboard = async () => {
    const fields = getAllDisplayFields();
    const entryContent = fields
      .map(field => `${field.title}:\n${field.value}`)
      .join('\n\n');

    const textToCopy = `--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---\n${entryContent}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyPastEntryTextSuccess(entry.timestamp);
      setTimeout(() => setCopyPastEntryTextSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy past entry text: ', err);
    }
  };

  const displayFields = getAllDisplayFields();

  return (
    <div key={entry.timestamp} className="p-4 bg-gray-700 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-100">
          Entry from {new Date(entry.timestamp).toLocaleString()}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={copyPastEntryPromptToClipboard}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {copyPastEntryPromptSuccess === entry.timestamp ? 'Copied!' : 'Copy Prompt'}
          </button>
          <button
            onClick={copyPastEntryTextToClipboard}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copyPastEntryTextSuccess === entry.timestamp ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>
      {displayFields.map(field => (
        <p key={field.key} className="text-sm text-gray-300">
          <span className="font-medium">{field.title}:</span> {field.value}
        </p>
      ))}
    </div>
  );
};

export default JournalEntryItem;