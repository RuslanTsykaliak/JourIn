
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // npm i lucide-react
import EditableTitle from './editableTitle';
import { PromptTemplate } from '../types';

interface SortablePromptItemProps {
  template: PromptTemplate;
  promptText: string;
  handlePromptTextChange: (id: string, text: string) => void;
  handleTitleChange: (id: string, text: string) => void;
  removeTemplate: (id: string) => void;
  isRemovable?: boolean;
}

const SortablePromptItem: React.FC<SortablePromptItemProps> = ({
  template,
  promptText,
  handlePromptTextChange,
  handleTitleChange,
  removeTemplate,
  isRemovable,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center mb-4">
      <div {...listeners} className="cursor-grab mr-2">
        <GripVertical />
      </div>
      <div className="flex-grow">
        <EditableTitle
          initialValue={template.title}
          onSave={(newTitle) => handleTitleChange(template.id, newTitle)}
          fieldKey={template.id}
        />
        <textarea
          value={promptText}
          onChange={(e) => handlePromptTextChange(template.id, e.target.value)}
          placeholder="Reflect here..."
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
        />
        {isRemovable && <button onClick={() => removeTemplate(template.id)} className="text-red-500">Remove</button>}
      </div>
    </div>
  );
};

export default SortablePromptItem;
