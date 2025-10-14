import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalingForm from '../app/components/DEV_journalingForm';
import '@testing-library/jest-dom';

const mockCustomTitles = {
  whatWentWell: 'What went well today?',
  whatILearned: 'What did I learn today?',
  whatWouldDoDifferently: 'What would I do differently?',
  nextStep: 'What’s my next step?',
};

const TestJournalingForm = ({ initialJournalEntries = {} }) => {
  const [journalEntries, setJournalEntries] = useState({
    whatWentWell: '',
    whatILearned: '',
    whatWouldDoDifferently: '',
    nextStep: '',
    ...initialJournalEntries,
  });
  const [additionalFields, setAdditionalFields] = useState([]);
  const [customTitles, setCustomTitles] = useState(mockCustomTitles);

  const handleCustomTitleChange = (key, value) => {
    setCustomTitles(prev => ({ ...prev, [key]: value }));
  };

  return (
    <JournalingForm
      journalEntries={journalEntries}
      onJournalEntriesChange={setJournalEntries}
      customTitles={customTitles}
      onCustomTitleChange={handleCustomTitleChange}
      additionalFields={additionalFields}
      setAdditionalFields={setAdditionalFields}
    />
  );
};

describe('DEV_JournalingForm', () => {
  it('hides the remove button for a custom field when typing in it', () => {
    const { container } = render(<TestJournalingForm />);
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');

    // Add a custom field
    fireEvent.mouseEnter(whatWentWellTextarea.closest('[data-testid^="sortable-item-"]'));
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    const newFieldTextarea = screen.getByPlaceholderText('Description');
    const sortableItem = newFieldTextarea.closest('[data-testid^="sortable-item-"]');

    // The remove button should be visible on hover when the field is empty
    fireEvent.mouseEnter(sortableItem);
    let removeButton = screen.getByText('-');
    expect(removeButton).toBeInTheDocument();
    fireEvent.mouseLeave(sortableItem);
    expect(container.querySelector('button.bg-red-600')).not.toBeInTheDocument();

    // Start typing in the textarea
    fireEvent.change(newFieldTextarea, { target: { value: 'Some text' } });

    // The remove button should not be visible on hover anymore
    fireEvent.mouseEnter(sortableItem);
    removeButton = screen.queryByText('-');
    expect(removeButton).not.toBeInTheDocument();
  });

  it('allows editing of an editable title', () => {
    render(<TestJournalingForm />);
    const titleElement = screen.getByText('What went well today?');

    // Double-click to enter edit mode
    fireEvent.doubleClick(titleElement);

    const inputElement = screen.getByDisplayValue('What went well today?');
    expect(inputElement).toBeInTheDocument();

    // Change the title
    fireEvent.change(inputElement, { target: { value: 'A new title' } });
    expect(inputElement).toHaveValue('A new title');

    // Press Enter to save
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    // The new title should be displayed
    expect(screen.getByText('A new title')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('A new title')).not.toBeInTheDocument(); // Input field should be gone
  });
});
