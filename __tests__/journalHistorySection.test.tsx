import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JournalHistorySection from '../app/components/journalHistorySection';
import '@testing-library/jest-dom';
import { JournalEntryWithTimestamp } from '../app/types';

// Mock the generatePromptText function
jest.mock('../app/utils/generatePromptText', () => ({
  generatePromptText: jest.fn((entry, customTitles, promptTemplate) => {
    if (promptTemplate) {
      return promptTemplate.replace('{{whatWentWell}}', entry.whatWentWell);
    }
    return `Default prompt for ${entry.whatWentWell}`;
  }),
}));

const mockPastEntries: JournalEntryWithTimestamp[] = [
  {
    timestamp: 1678886400000,
    whatWentWell: 'Learned about testing',
    whatILearned: '',
    whatWouldDoDifferently: '',
    nextStep: '',
    userGoal: '',
  },
  {
    timestamp: 1678800000000,
    whatWentWell: 'Used a custom prompt',
    whatILearned: '',
    whatWouldDoDifferently: '',
    nextStep: '',
    userGoal: '',
    promptTemplate: 'Custom prompt: {{whatWentWell}}',
  },
];

describe('JournalHistorySection', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('should render past entries from localStorage', async () => {
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    // Wait for the component to load entries from localStorage
    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });
    expect(screen.getByText(/Learned about testing/)).toBeInTheDocument();
  });

  it('should copy a default prompt to the clipboard', async () => {
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    // Wait for entries to load first
    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });

    const copyPromptButtons = screen.getAllByRole('button', { name: /copy prompt/i });
    fireEvent.click(copyPromptButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Default prompt for Learned about testing');
    });
  });

  it('should copy a custom prompt to the clipboard', async () => {
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    // Wait for entries to load first
    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });

    const copyPromptButtons = screen.getAllByRole('button', { name: /copy prompt/i });
    fireEvent.click(copyPromptButtons[1]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Custom prompt: Used a custom prompt');
    });
  });

  it('should add a new entry to the history', () => {
    render(<JournalHistorySection newEntryToHistory={mockPastEntries[0]} />);
    expect(screen.getByText(/Learned about testing/)).toBeInTheDocument();
  });

  it('should generate a weekly summary for entries within a selected week', async () => {
    const weeklyEntries: JournalEntryWithTimestamp[] = [
      {
        timestamp: new Date('2025-08-11T10:00:00Z').getTime(), // Monday
        whatWentWell: 'Monday entry',
        whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
      },
      {
        timestamp: new Date('2025-08-13T10:00:00Z').getTime(), // Wednesday
        whatWentWell: 'Wednesday entry',
        whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
      },
      {
        timestamp: new Date('2025-08-15T10:00:00Z').getTime(), // Friday
        whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
        whatWentWell: 'Friday entry' // Fixed: was empty string
      },
    ];
    localStorage.setItem('jourin_past_entries', JSON.stringify(weeklyEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    // The component initializes to the current week. The test data is for a previous week.
    // We need to click the "Previous Week" button to navigate to the correct week.
    const previousWeekButton = screen.getByRole('button', { name: /previous week/i });
    fireEvent.click(previousWeekButton);

    // Wait for entries to load from localStorage first
    await waitFor(() => {
      expect(screen.getByText(/Monday entry/)).toBeInTheDocument();
    });

    // Now look for the Generate Weekly Summary button
    const generateSummaryButton = screen.getByRole('button', { name: /generate weekly summary/i });
    fireEvent.click(generateSummaryButton);

    // Assert that a summary modal appears
    await waitFor(() => {
      // Assert that the modal is visible
      expect(screen.getByRole('dialog', { name: /weekly summary/i })).toBeInTheDocument();

      // Assert that the textarea contains the consolidated text
      const summaryTextarea = screen.getByRole('textbox');
      expect(summaryTextarea.value).toContain('Monday entry');
      expect(summaryTextarea.value).toContain('Wednesday entry');
      expect(summaryTextarea.value).toContain('Friday entry');
    });
  });
});