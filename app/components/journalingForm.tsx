// app/components/journalingForm.tsx
"use client";

import React from 'react';

interface JournalEntries {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  mySuccesses: string;
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
            What went well this day?
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
            What did I learn?
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
          <label htmlFor="mySuccesses" className="block text-sm font-medium text-gray-300">
            What are my successes?
          </label>
          <div className="mt-1">
            <textarea
              id="mySuccesses"
              name="mySuccesses"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
              placeholder="List your accomplishments, big or small, that you're proud of..."
              value={journalEntries.mySuccesses}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}