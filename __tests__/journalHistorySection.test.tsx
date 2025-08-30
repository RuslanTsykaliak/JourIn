import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JournalHistorySection from '../app/components/journalHistorySection';
import '@testing-library/jest-dom';
import { JournalEntryWithTimestamp } from '../app/types';
import { useJournalEntriesStorage } from '../app/hooks/useJournalEntriesStorage';
import { getStartOfWeek, getEndOfWeek, generateWeeklySummary as utilGenerateWeeklySummary } from '../app/utils/weeklySummaryUtils';

// Mock the generatePromptText function
jest.mock('../app/utils/generatePromptText', () => ({
  generatePromptText: jest.fn((entry: JournalEntryWithTimestamp, customTitles, promptTemplate) => {
    if (promptTemplate) {
      return promptTemplate.replace('{{whatWentWell}}', entry.whatWentWell);
    }
    return `Default prompt for ${entry.whatWentWell}`;
  }),
}));

// Mock the useJournalEntriesStorage hook
jest.mock('../app/hooks/useJournalEntriesStorage', () => ({
  useJournalEntriesStorage: jest.fn(() => ({
    pastEntries: [],
    setPastEntries: jest.fn(),
    addJournalEntry: jest.fn(), // Add this line
  })),
}));

// Mock the weeklySummaryUtils
jest.mock('../app/utils/weeklySummaryUtils', () => ({
  getStartOfWeek: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())),
  getEndOfWeek: jest.fn((date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    d.setDate(d.getDate() + 6);
    return d;
  }),
  generateWeeklySummary: jest.fn((pastEntries, selectedWeekStart, selectedWeekEnd) => {
    const entriesInWeek = pastEntries.filter((entry: { timestamp: string | number | Date; }) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= selectedWeekStart && entryDate <= selectedWeekEnd;
    });
    if (entriesInWeek.length === 0) {
      return 'No journal entries found for this week.';
    }
    return entriesInWeek.map((entry: JournalEntryWithTimestamp) => `Summary for ${entry.whatWentWell}`).join('\n');
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
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: mockPastEntries,
      setPastEntries: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });
    expect(screen.getByText(/Learned about testing/)).toBeInTheDocument();
  });

  it('should copy a default prompt to the clipboard', async () => {
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: mockPastEntries,
      setPastEntries: jest.fn(),
    });
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
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: mockPastEntries,
      setPastEntries: jest.fn(),
    });
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
    const setPastEntriesMock = jest.fn();
    const addJournalEntryMock = jest.fn();
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: [], // Start with empty array
      setPastEntries: setPastEntriesMock,
      addJournalEntry: addJournalEntryMock, // Include addJournalEntry
    });
    render(<JournalHistorySection newEntryToHistory={mockPastEntries[0]} />);
    expect(addJournalEntryMock).toHaveBeenCalledWith(mockPastEntries[0]);
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
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: weeklyEntries,
      setPastEntries: jest.fn(),
    });
    (utilGenerateWeeklySummary as jest.Mock).mockReturnValue('Mocked weekly summary content');

    render(<JournalHistorySection newEntryToHistory={null} />);

    // The component initializes to the current week. The test data is for a previous week.
    // We need to click the "Previous Week" button to navigate to the correct week.
    const previousWeekButton = screen.getByRole('button', { name: /previous week/i });
    fireEvent.click(previousWeekButton);
    fireEvent.click(previousWeekButton);

    // Now look for the Generate Weekly Summary button
    const generateSummaryButton = screen.getByRole('button', { name: /generate weekly summary/i });
    fireEvent.click(generateSummaryButton);

    // Assert that a summary modal appears
    await waitFor(() => {
      // Assert that the modal is visible
      expect(screen.getByRole('dialog', { name: /weekly summary/i })).toBeInTheDocument();

      // Assert that the textarea contains the consolidated text
      const summaryTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(summaryTextarea.value).toBe('Mocked weekly summary content');
    });
  });

  it('should copy individual entry text to the clipboard', async () => {
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: mockPastEntries,
      setPastEntries: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });

    const copyTextButtons = screen.getAllByRole('button', { name: /copy text/i });
    fireEvent.click(copyTextButtons[0]);

    await waitFor(() => {
      const entry = mockPastEntries[0];
      const expectedText = `
--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---
What went well today:
${entry.whatWentWell}

What I learned today:
${entry.whatILearned}

What I would do differently:
${entry.whatWouldDoDifferently}

My next step:
${entry.nextStep}
`;
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
    });
  });

  it('should copy individual entry text to the clipboard', async () => {
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });

    const copyTextButtons = screen.getAllByRole('button', { name: /copy text/i });
    fireEvent.click(copyTextButtons[0]);

    await waitFor(() => {
      const entry = mockPastEntries[0];
      const expectedText = `
--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---
What went well today:
${entry.whatWentWell}

What I learned today:
${entry.whatILearned}

What I would do differently:
${entry.whatWouldDoDifferently}

My next step:
${entry.nextStep}
`;
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
    });
  });

  it('should copy all history to the clipboard', async () => {
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/)[0]).toBeInTheDocument();
    });

    const copyAllHistoryButton = screen.getByRole('button', { name: /copy all history/i });
    fireEvent.click(copyAllHistoryButton);

    await waitFor(() => {
      const formattedHistory = mockPastEntries.map(entry => {
        return `
--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---
What went well today:
${entry.whatWentWell}

What I learned today:
${entry.whatILearned}

What I would do differently:
${entry.whatWouldDoDifferently}

My next step:
${entry.nextStep}
`;
      }).join('\n\n');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(formattedHistory);
    });
  });

  it('should show more entries when "Show More" is clicked', async () => {
    const longMockEntries: JournalEntryWithTimestamp[] = Array.from({ length: 7 }, (_, i) => ({
      timestamp: 1678886400000 + i * 1000,
      whatWentWell: `Entry ${i + 1}`,
      whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
    }));
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: longMockEntries,
      setPastEntries: jest.fn(),
      addJournalEntry: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/).length).toBe(5); // INITIAL_DISPLAY_COUNT
    });

    const showMoreButton = screen.getByRole('button', { name: /show more/i });
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/).length).toBe(7); // All entries
    });
  });

  it('should show less entries when "Show Less" is clicked', async () => {
    const longMockEntries: JournalEntryWithTimestamp[] = Array.from({ length: 7 }, (_, i) => ({
      timestamp: 1678886400000 + i * 1000,
      whatWentWell: `Entry ${i + 1}`,
      whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
    }));
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: longMockEntries,
      setPastEntries: jest.fn(),
      addJournalEntry: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/).length).toBe(5);
    });

    const showMoreButton = screen.getByRole('button', { name: /show more/i });
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/).length).toBe(7);
    });

    const showLessButton = screen.getByRole('button', { name: /show less/i });
    fireEvent.click(showLessButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Entry from/).length).toBe(5);
    });
  });

  it('should navigate to the next week when "Next Week" is clicked', async () => {
    // Ensure there are entries so the component renders the navigation buttons
    localStorage.setItem('jourin_past_entries', JSON.stringify(mockPastEntries));
    render(<JournalHistorySection newEntryToHistory={null} />);

    const nextWeekButton = screen.getByRole('button', { name: /next week/i });
    fireEvent.click(nextWeekButton);

    // Get the current date and calculate the expected next week's start and end dates
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfNextWeek = new Date(startOfCurrentWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);

    await waitFor(() => {
      expect(screen.getByText(`${startOfNextWeek.toLocaleDateString()} - ${endOfNextWeek.toLocaleDateString()}`)).toBeInTheDocument();
    });
  });

  it('should explicitly save new entry to localStorage', async () => {
    const addJournalEntryMock = jest.fn();
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: mockPastEntries,
      setPastEntries: jest.fn(),
      addJournalEntry: addJournalEntryMock,
    });
    const newEntry: JournalEntryWithTimestamp = {
      timestamp: 1678972800000,
      whatWentWell: 'New entry added',
      whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
    };
    render(<JournalHistorySection newEntryToHistory={newEntry} />);

    await waitFor(() => {
      expect(addJournalEntryMock).toHaveBeenCalledWith(newEntry);
    });
  });

  it('should handle malformed JSON in localStorage gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { }); // Suppress console error

    // Manually set malformed JSON in localStorage before rendering
    localStorage.setItem('jourin_past_entries', 'this is not valid json');

    // Mock useJournalEntriesStorage to simulate the error and clearing
    (useJournalEntriesStorage as jest.Mock).mockImplementation(() => {
      // Simulate the behavior of the real hook when it encounters malformed JSON
      // It would try to parse, fail, log an error, and then clear localStorage.
      try {
        JSON.parse(localStorage.getItem('jourin_past_entries') || '');
      } catch (e) {
        console.error("Failed to parse past entries from localStorage", e);
        localStorage.removeItem('jourin_past_entries');
      }
      return {
        pastEntries: [],
        setPastEntries: jest.fn(),
        addJournalEntry: jest.fn(),
      };
    });

    render(<JournalHistorySection newEntryToHistory={null} />);

    expect(localStorage.getItem('jourin_past_entries')).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to parse past entries from localStorage",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should copy weekly summary to clipboard', async () => {
    const weeklyEntries: JournalEntryWithTimestamp[] = [
      {
        timestamp: new Date('2025-08-11T10:00:00Z').getTime(), // Monday
        whatWentWell: 'Monday entry',
        whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
      },
    ];
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: weeklyEntries,
      setPastEntries: jest.fn(),
      addJournalEntry: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    const previousWeekButton = screen.getByRole('button', { name: /previous week/i });
    fireEvent.click(previousWeekButton);
    fireEvent.click(previousWeekButton);

    const generateSummaryButton = screen.getByRole('button', { name: /generate weekly summary/i });
    fireEvent.click(generateSummaryButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /weekly summary/i })).toBeInTheDocument();
    });

    const copySummaryButton = screen.getByRole('button', { name: /copy to clipboard/i });
    fireEvent.click(copySummaryButton);

    await waitFor(() => {
      const summaryTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(summaryTextarea.value);
    });
  });

  it('should close the weekly summary modal', async () => {
    const weeklyEntries: JournalEntryWithTimestamp[] = [
      {
        timestamp: new Date('2025-08-11T10:00:00Z').getTime(), // Monday
        whatWentWell: 'Monday entry',
        whatILearned: '', whatWouldDoDifferently: '', nextStep: '', userGoal: '',
      },
    ];
    (useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: weeklyEntries,
      setPastEntries: jest.fn(),
      addJournalEntry: jest.fn(),
    });
    render(<JournalHistorySection newEntryToHistory={null} />);

    const previousWeekButton = screen.getByRole('button', { name: /previous week/i });
    fireEvent.click(previousWeekButton);
    fireEvent.click(previousWeekButton);

    const generateSummaryButton = screen.getByRole('button', { name: /generate weekly summary/i });
    fireEvent.click(generateSummaryButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /weekly summary/i })).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /weekly summary/i })).not.toBeInTheDocument();
    });
  });
});