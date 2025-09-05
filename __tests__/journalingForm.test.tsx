import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalingForm from '../app/components/journalingForm';
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

  return (
    <JournalingForm
      journalEntries={journalEntries}
      onJournalEntriesChange={setJournalEntries}
      customTitles={mockCustomTitles}
      onCustomTitleChange={() => {}}
      additionalFields={additionalFields}
      setAdditionalFields={setAdditionalFields}
    />
  );
};

describe('JournalingForm', () => {
  it('shows a plus button on hover when the textarea is empty', () => {
    render(<TestJournalingForm />);
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    expect(addButton).toBeInTheDocument();
    fireEvent.mouseLeave(whatWentWellTextarea.parentElement);
    expect(addButton).not.toBeInTheDocument();
  });

  it('does not show the plus button on hover when the textarea has content', () => {
    render(<TestJournalingForm initialJournalEntries={{ whatWentWell: 'Today was a good day' }} />);
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.queryByText('+');
    expect(addButton).not.toBeInTheDocument();
  });

  it('adds a title and description field when the plus button is clicked', () => {
    render(<TestJournalingForm />);
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);
    const newFieldTitle = screen.getByText('New Field');
    const descriptionTextarea = screen.getByPlaceholderText('Description');
    expect(newFieldTitle).toBeInTheDocument();
    expect(descriptionTextarea).toBeInTheDocument();
  });

  it('removes the title and description field when the minus button is clicked', () => {
    render(<TestJournalingForm />);
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    
    // Add a field
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Check that the field is there
    const newFieldTitle = screen.getByText('New Field');
    const descriptionTextarea = screen.getByPlaceholderText('Description');
    expect(newFieldTitle).toBeInTheDocument();
    expect(descriptionTextarea).toBeInTheDocument();

    // Hover to show the remove button and click it
    fireEvent.mouseEnter(newFieldTitle.parentElement.parentElement); // The wrapper div
    const removeButton = screen.getByText('-');
    fireEvent.click(removeButton);

    // Check that the field is gone
    expect(newFieldTitle).not.toBeInTheDocument();
    expect(descriptionTextarea).not.toBeInTheDocument();
  });

  
});