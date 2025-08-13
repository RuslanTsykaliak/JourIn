// app/components/journalingForm.tsx
"use client";

import React from 'react';

interface JournalEntries {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
}

interface JournalingFormProps {
  journalEntries: JournalEntries;
  onJournalEntriesChange: (entries: JournalEntries) => void;
}

export default function JournalingForm({ journalEntries, onJournalEntriesChange }: JournalingFormProps) {

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onJournalEntriesChange({
      ...journalEntries,
      [name]: value,
    });
  };

  return (
    <div className="mt-8">
      <form className="space-y-6">
        <div>
          <label htmlFor="whatWentWell" className="block text-sm font-medium text-gray-300">
            What went well today?
          </label>
          <div className="mt-1">
            <textarea
              id="whatWentWell"
              name="whatWentWell"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Reflect on your achievements and positive experiences..."
              value={journalEntries.whatWentWell}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div>
          <label htmlFor="whatILearned" className="block text-sm font-medium text-gray-300">
            What did I learn today?
          </label>
          <div className="mt-1">
            <textarea
              id="whatILearned"
              name="whatILearned"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Jot down new insights, skills, or knowledge gained..."
              value={journalEntries.whatILearned}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div>
          <label htmlFor="whatWouldDoDifferently" className="block text-sm font-medium text-gray-300">
            What would I do differently?
          </label>
          <div className="mt-1">
            <textarea
              id="whatWouldDoDifferently"
              name="whatWouldDoDifferently"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Consider areas for improvement and alternative approaches..."
              value={journalEntries.whatWouldDoDifferently}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div>
          <label htmlFor="nextStep" className="block text-sm font-medium text-gray-300">
            What’s my next step?
          </label>
          <div className="mt-1">
            <textarea
              id="nextStep"
              name="nextStep"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="Outline the specific actions you’ll take tomorrow or in the near future based on today’s experiences..."
              value={journalEntries.nextStep}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}
