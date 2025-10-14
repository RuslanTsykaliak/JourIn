// Comments are not removable
// app/components/DEV_journalingForm.tsx // will be replaced with journalingForm.tsx after testing.

import React, { useState, useEffect, ChangeEvent } from "react";
import { JournalEntries, CustomTitles } from "../types";
import EditableTitle from './editableTitle';
import { useReward } from "../hooks/useReward";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface JournalingFormProps {
  journalEntries: JournalEntries;
  onJournalEntriesChange: (entries: JournalEntries) => void;
  customTitles: CustomTitles;
  onCustomTitleChange: (key: string, value: string) => void;
  additionalFields: string[];
  setAdditionalFields: React.Dispatch<React.SetStateAction<string[]>>;
}

interface SortableItem {
  id: string;
  title: string;
  placeholder: string;
}

function SortableTextareaItem({
  item,
  journalEntries,
  onJournalEntriesChange,
  onCustomTitleChange,
  customTitles,
  additionalFields,
  setAdditionalFields,
  handleRemoveField,
  handleAddField,
  isRemovable
}: {
  item: SortableItem;
  journalEntries: JournalEntries;
  onJournalEntriesChange: (entries: JournalEntries) => void;
  onCustomTitleChange: (key: string, value: string) => void;
  customTitles: CustomTitles;
  additionalFields: string[];
  setAdditionalFields: React.Dispatch<React.SetStateAction<string[]>>;
  handleRemoveField: (fieldName: string) => void;
  handleAddField: () => void;
  isRemovable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isHovered, setIsHovered] = useState(false);
  const hasContent = journalEntries[item.id] && typeof journalEntries[item.id] === 'string' && (journalEntries[item.id] as string).length > 0;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onJournalEntriesChange({
      ...journalEntries,
      [name]: value,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="mb-4"
      data-testid={`sortable-item-${item.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <label {...listeners} htmlFor={item.id} className="block text-sm font-medium text-gray-300 text-center cursor-grab">
          <EditableTitle
            initialValue={item.title}
            onSave={(newValue) => onCustomTitleChange(item.id, newValue)}
            fieldKey={item.id}
          />
        </label>
        <div className="mt-1">
          <textarea
            id={item.id}
            name={item.id}
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-600 rounded-md p-2 bg-gray-700 text-gray-100"
            placeholder={item.placeholder}
            value={(journalEntries[item.id] as string) || ''}
            onChange={handleChange}
          />
        </div>
        {isHovered && !hasContent && !isRemovable && (
          <button
            type="button"
            onClick={handleAddField}
            className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-gray-600 rounded-full text-white hover:bg-gray-500 flex items-center justify-center"
          >
            +
          </button>
        )}
        {isHovered && isRemovable && (
          <button
            type="button"
            onClick={() => handleRemoveField(item.id)}
            className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-red-600 rounded-full text-white hover:bg-red-500 flex items-center justify-center"
          >
            -
          </button>
        )}
      </div>
    </div>
  );
}

export default function JournalingForm({
  journalEntries,
  onJournalEntriesChange,
  customTitles,
  onCustomTitleChange,
  additionalFields,
  setAdditionalFields,
}: JournalingFormProps) {
  const { showReward } = useReward();
  const [items, setItems] = useState<SortableItem[]>([]);

  useEffect(() => {
    const defaultItems: SortableItem[] = [
      { id: 'whatWentWell', title: customTitles.whatWentWell, placeholder: 'Reflect on your achievements and positive experiences...' },
      { id: 'whatILearned', title: customTitles.whatILearned, placeholder: 'Jot down new insights, skills, or knowledge gained...' },
      { id: 'whatWouldDoDifferently', title: customTitles.whatWouldDoDifferently, placeholder: 'Consider areas for improvement and alternative approaches...' },
      { id: 'nextStep', title: customTitles.nextStep, placeholder: 'Outline the specific actions you’ll take tomorrow or in the near future based on today’s experiences...' },
    ];

    const additionalItems: SortableItem[] = additionalFields.map(fieldName => ({
      id: fieldName,
      title: (journalEntries[`${fieldName}_title`] as string) || 'New Field',
      placeholder: 'Description'
    }));

    const allItems = [...defaultItems, ...additionalItems];

    const savedOrderJSON = localStorage.getItem('jourin_dnd_order');
    if (savedOrderJSON) {
      const savedOrder = JSON.parse(savedOrderJSON);
      const orderedItems = savedOrder
        .map((id: string) => allItems.find(item => item.id === id))
        .filter((item: SortableItem | undefined): item is SortableItem => !!item);

      const newItems = allItems.filter(item => !savedOrder.includes(item.id));
      setItems([...orderedItems, ...newItems]);
    } else {
      setItems(allItems);
    }

  }, [additionalFields, customTitles, journalEntries]);


  const handleAddField = () => {
    const newFieldName = `customField_${additionalFields.length}`;
    setAdditionalFields([...additionalFields, newFieldName]);
    showReward("New field added!");
  };

  const handleRemoveField = (fieldName: string) => {
    setAdditionalFields(additionalFields.filter(field => field !== fieldName));
    const newEntries = { ...journalEntries };
    delete newEntries[fieldName];
    delete newEntries[`${fieldName}_title`];
    onJournalEntriesChange(newEntries);
    showReward("Field removed!");

    const savedOrderJSON = localStorage.getItem('jourin_dnd_order');
    if (savedOrderJSON) {
      const savedOrder = JSON.parse(savedOrderJSON);
      const newOrder = savedOrder.filter((id: string) => id !== fieldName);
      localStorage.setItem('jourin_dnd_order', JSON.stringify(newOrder));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const newOrder = newItems.map(item => item.id);
        localStorage.setItem('jourin_dnd_order', JSON.stringify(newOrder));

        return newItems;
      });
    }
  }

  const defaultFieldIds = ['whatWentWell', 'whatILearned', 'whatWouldDoDifferently', 'nextStep'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-8">
          <form className="space-y-6">
            {items.map(item => (
              <SortableTextareaItem
                key={item.id}
                item={item}
                journalEntries={journalEntries}
                onJournalEntriesChange={onJournalEntriesChange}
                onCustomTitleChange={(id, newTitle) => {
                  if (defaultFieldIds.includes(id)) {
                    onCustomTitleChange(id, newTitle);
                  } else {
                    onJournalEntriesChange({ ...journalEntries, [`${id}_title`]: newTitle });
                  }
                }}
                customTitles={customTitles}
                additionalFields={additionalFields}
                setAdditionalFields={setAdditionalFields}
                handleRemoveField={handleRemoveField}
                handleAddField={handleAddField}
                isRemovable={!defaultFieldIds.includes(item.id)}
              />
            ))}
          </form>
          {/* End */}
        </div>
      </SortableContext>
    </DndContext>
  );
}