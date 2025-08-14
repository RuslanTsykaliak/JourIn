// app/components/promptTemplateEditor.tsx
import React, { useState, useEffect } from 'react';
import { defaultPromptTemplate } from '../lib/promptTemplate';

interface PromptTemplateEditorProps {
  initialTemplate: string;
  onSave: (template: string) => void;
  onClose: () => void;
}

const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onClose,
}) => {
  const [template, setTemplate] = useState(initialTemplate);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  const handleSave = () => {
    onSave(template);
    onClose();
  };

  const handleReset = () => {
    setTemplate(defaultPromptTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Customize Prompt Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Edit the template used to generate LinkedIn posts. Use placeholders like{' '}
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 rounded">
            {'{{whatWentWell}}'}
          </code>{' '}
          to insert your journal entries.
        </p>

        {/* Textarea */}
        <textarea
          aria-label="Customize Prompt Template"
          className="w-full h-64 p-2 border border-gray-300 dark:border-gray-700 rounded-md font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTemplateEditor;
