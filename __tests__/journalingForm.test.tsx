
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalingForm from '../app/components/journalingForm';
import '@testing-library/jest-dom';

describe('JournalingForm', () => {
  const mockJournalEntries = {
    whatWentWell: '',
    whatILearned: '',
    whatWouldDoDifferently: '',
    nextStep: '',
  };

  const mockCustomTitles = {
    whatWentWell: 'What went well today?',
    whatILearned: 'What did I learn today?',
    whatWouldDoDifferently: 'What would I do differently?',
    nextStep: 'What’s my next step?',
  };

  it('shows a plus button on hover when the textarea is empty', () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={() => {}}
        customTitles={mockCustomTitles}
        onCustomTitleChange={() => {}}
      />
    );
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    expect(addButton).toBeInTheDocument();
    fireEvent.mouseLeave(whatWentWellTextarea.parentElement);
    expect(addButton).not.toBeInTheDocument();
  });

  it('does not show the plus button on hover when the textarea has content', () => {
    render(
      <JournalingForm
        journalEntries={{ ...mockJournalEntries, whatWentWell: 'Today was a good day' }}
        onJournalEntriesChange={() => {}}
        customTitles={mockCustomTitles}
        onCustomTitleChange={() => {}}
      />
    );
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.queryByText('+');
    expect(addButton).not.toBeInTheDocument();
  });

  it('adds a title and description field when the plus button is clicked', () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={() => {}}
        customTitles={mockCustomTitles}
        onCustomTitleChange={() => {}}
      />
    );
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);
    const titleInput = screen.getByPlaceholderText('Title');
    const descriptionTextarea = screen.getByPlaceholderText('Description');
    expect(titleInput).toBeInTheDocument();
    expect(descriptionTextarea).toBeInTheDocument();
  });

  it('removes the title and description field when the minus button is clicked', () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={() => {}}
        customTitles={mockCustomTitles}
        onCustomTitleChange={() => {}}
      />
    );
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.mouseEnter(whatWentWellTextarea.parentElement);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);
    const titleInput = screen.getByPlaceholderText('Title');
    const descriptionTextarea = screen.getByPlaceholderText('Description');
    const removeButton = screen.getByText('-');
    fireEvent.click(removeButton);
    expect(titleInput).not.toBeInTheDocument();
    expect(descriptionTextarea).not.toBeInTheDocument();
  });
});
