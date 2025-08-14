import React, { useState } from 'react';

interface PromptTemplateEditorProps {
  template: string;
  onSave: (newTemplate: string) => void;
  onReset: () => void;
}

export default function PromptTemplateEditor({
  template,
  onSave,
  onReset,
}: PromptTemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState(template);

  const handleSave = () => {
    onSave(editedTemplate);
  };

  return (
    <div className="mt-4">
      <label htmlFor="prompt-template" className="block text-sm font-medium text-gray-300">
        Prompt Template
      </label>
      <textarea
        id="prompt-template"
        name="prompt-template"
        rows={10}
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
        value={editedTemplate}
        onChange={(e) => setEditedTemplate(e.target.value)}
        aria-label="Prompt Template"
      />
      <div className="mt-2 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset to Default
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}
