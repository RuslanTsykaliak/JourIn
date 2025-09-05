'use client';
import React from 'react';

const YesNoQuestion = ({ question, name, value, onChange }: { question: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
        <p className="text-sm font-medium text-gray-700">{question}</p>
        <div className="flex gap-4 mt-1">
            <label><input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange} /> Yes</label>
            <label><input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange} /> No</label>
        </div>
    </div>
);

export default YesNoQuestion;
