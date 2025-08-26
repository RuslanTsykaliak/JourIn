import React, { useState } from 'react';

interface EditableTitleProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  fieldKey: string; // To identify which title this is (e.g., 'whatWentWell')
}

export default function EditableTitle({
  initialValue,
  onSave,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== initialValue) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (currentValue !== initialValue) {
        onSave(currentValue);
      }
    }
  };

  return (
    <span
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer hover:text-indigo-400 transition-colors duration-200 relative ${isEditing ? 'block w-full' : 'inline-block'}`}
    >
      {isEditing ? (
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-1 text-sm font-medium w-full"
          autoFocus
          aria-label={`Edit ${initialValue}`}
        />
      ) : (
        <>
          <span>{currentValue}</span>
          {isHovered && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-gray-500 text-xs italic whitespace-nowrap">
              (double-click to edit)
            </span>
          )}
        </>
      )}
    </span>
  );
}
