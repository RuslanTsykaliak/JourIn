import React, { useState } from 'react';
import { JournalEntryWithTimestamp, CustomTitles, JournalCoreFields, JournalEntryForDisplay, defaultTitles } from '../types';
import { generatePromptTextDB } from '../utils/generatePromptTextDB';

interface JournalEntryItemProps {
  entry: JournalEntryWithTimestamp;
}

const JournalEntryItemDB: React.FC<JournalEntryItemProps> = ({ entry }) => {
  const [copyPastEntryPromptSuccess, setCopyPastEntryPromptSuccess] = useState<number | null>(null);
  const [copyPastEntryTextSuccess, setCopyPastEntryTextSuccess] = useState<number | null>(null);

  const displayEntry = entry as JournalEntryForDisplay;

  const getAllDisplayFields = () => {
    const fields: { key: string; value: string; title: string }[] = [];
    const titles = { ...defaultTitles, ...(displayEntry.customTitles || {}) };
    const addedKeys = new Set<string>();

    const keysToDisplay: (keyof JournalCoreFields)[] = [
      'whatWentWell',
      'whatILearned',
      'whatWouldDoDifferently',
      'nextStep'
    ];

    keysToDisplay.forEach(key => {
      const value = displayEntry[key];
      if (value && value.trim() !== '' && !addedKeys.has(key)) {
        const title = (displayEntry.customTitles && displayEntry.customTitles[key]) ? displayEntry.customTitles[key] : defaultTitles[key];
        fields.push({ key, value, title });
        addedKeys.add(key);
      }
    });

    const dynamicFields = displayEntry.dynamicFields;
    if (dynamicFields && typeof dynamicFields === 'object') {
      Object.keys(dynamicFields).forEach(key => {
        const value = dynamicFields[key];
        const title = (displayEntry.customTitles && displayEntry.customTitles[`${key}_title`]) ? displayEntry.customTitles[`${key}_title`] : key;
        if (value && value.trim() !== '' && !addedKeys.has(key)) {
          fields.push({ key, value, title });
          addedKeys.add(key);
        }
      });
    }

    return fields;
  };

  const copyPastEntryPromptToClipboard = async () => {
    const promptToCopy = generatePromptTextDB(entry, displayEntry.customTitles || {}, displayEntry.promptTemplate);
    try {
      await navigator.clipboard.writeText(promptToCopy);
      setCopyPastEntryPromptSuccess(displayEntry.timestamp);
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

    const textToCopy = `--- Journal Entry (${new Date(displayEntry.timestamp).toLocaleString()}) ---\n${entryContent}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyPastEntryTextSuccess(displayEntry.timestamp);
      setTimeout(() => setCopyPastEntryTextSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy past entry text: ', err);
    }
  };

  const displayFields = getAllDisplayFields();

  return (
    <div key={displayEntry.timestamp} className="p-4 bg-gray-700 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-100">
          Entry from {new Date(displayEntry.timestamp).toLocaleString()}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={copyPastEntryPromptToClipboard}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {copyPastEntryPromptSuccess === displayEntry.timestamp ? 'Copied!' : 'Copy Prompt'}
          </button>
          <button
            onClick={copyPastEntryTextToClipboard}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copyPastEntryTextSuccess === displayEntry.timestamp ? 'Copied!' : 'Copy Text'}
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

export default JournalEntryItemDB;