'use client';
import React from 'react';

// Helper component for 1-5 scale questions
const ScaleQuestion = ({ question, name, descriptions, value, onChange }: { question: string, name: string, descriptions: string[], value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <p className="text-sm font-medium text-gray-700">{question}</p>
    <div className="flex flex-col gap-2 mt-1">
      {descriptions.map((desc, index) => (
        <label key={index} className="flex items-center gap-2">
          <input type="radio" name={name} value={index + 1} checked={value === (index + 1).toString()} onChange={onChange} />
          <span>{desc}</span>
        </label>
      ))}
    </div>
  </div>
);

export default ScaleQuestion;
