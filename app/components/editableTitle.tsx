import React, { useState, useEffect, useRef } from 'react';

interface EditableTitleProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  fieldKey: string; // To identify which title this is (e.g., 'whatWentWell')
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string; // New prop for placeholder
}

export default function EditableTitle({
  initialValue,
  onSave,
  onFocus,
  onBlur,
  placeholder,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text when editing starts
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Always save the current value, even if it's empty
    if (currentValue !== initialValue) {
      onSave(currentValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      // Always save the current value, even if it's empty
      if (currentValue !== initialValue) {
        onSave(currentValue);
      }
    } else if (e.key === 'Escape') {
      // Cancel editing and revert to original value
      setCurrentValue(initialValue);
      setIsEditing(false);
    }
  };

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer relative block w-full`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-1 text-sm font-medium w-full"
          autoFocus
          aria-label={`Edit ${initialValue}`}
          placeholder={placeholder || "Write your question"}
        />
      ) : (
        <span className={`
          block w-full p-1 rounded-md
          ${currentValue.trim() === '' ? 'text-gray-400 italic' : 'text-gray-100'}
          ${isHovered ? 'hover:text-indigo-400 transition-colors duration-200' : ''}
        `}>
          {currentValue.trim() === '' ? (placeholder || "Write your question") : currentValue}
          {isHovered && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-gray-500 text-xs italic whitespace-nowrap">
              (Double-click to edit)
            </span>
          )}
        </span>
      )}
    </span>
  );
}