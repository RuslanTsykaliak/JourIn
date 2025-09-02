
'use client';

import React, { useState } from 'react';
import EditableTitle from './editableTitle';
import { JournalingTextareaProps } from '../types';

export default function JournalingTextarea({
  name,
  placeholder,
  title,
  value,
  onChange,
  onCustomTitleChange,
  onAddField,
}: JournalingTextareaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasContent = value && value.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          value={value}
          onChange={onChange}
        />
      </div>
      {isHovered && !hasContent && (
        <button
          type="button"
          onClick={onAddField}
          className="absolute top-0 right-0 mt-1 mr-1 p-1 bg-gray-600 rounded-full text-white hover:bg-gray-500"
        >
          +
        </button>
      )}
    </div>
  );
}
