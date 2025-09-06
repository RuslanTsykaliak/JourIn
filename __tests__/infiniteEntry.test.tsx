// __tests__/infiniteEntry.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils'; // Use custom render
import Home from '../app/page';
import * as fireUp from '../app/lib/fireUp';
import * as generatePromptText from '../app/utils/generatePromptText';
import * as useJournalEntriesStorage from '../app/hooks/useJournalEntriesStorage';

// Mock necessary modules
jest.mock('../app/lib/fireUp');
jest.mock('../app/utils/generatePromptText');
jest.mock('../app/hooks/useJournalEntriesStorage');

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Infinite Entry Creation Bug', () => {
  let addJournalEntryMock: jest.Mock;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset all mocks
    jest.clearAllMocks();

    // Mock useJournalEntriesStorage
    addJournalEntryMock = jest.fn();
    (useJournalEntriesStorage.useJournalEntriesStorage as jest.Mock).mockReturnValue({
      pastEntries: [],
      addJournalEntry: addJournalEntryMock,
    });

    // Mock fireUp functions
    (fireUp.getStreakData as jest.Mock).mockReturnValue({ currentStreak: 0, lastPostDate: null });
    (fireUp.updateStreak as jest.Mock).mockImplementation(() => Promise.resolve());

    // Mock generatePromptText
    (generatePromptText.generatePromptText as jest.Mock).mockReturnValue('dummy prompt');
  });

  test('should not create endless entries when "Generate Post Prompt" is clicked', async () => {
    render(<Home />);

    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.change(whatWentWellTextarea, { target: { value: 'Test entry' } });

    const generateButton = screen.getByRole('button', { name: /Generate Post Prompt/i });

    // Click the button
    fireEvent.click(generateButton);

    // Wait for a short period to allow any potential loops to manifest
    // We expect addJournalEntry to be called only once for a single click
    await waitFor(() => {
      // This assertion will fail if addJournalEntryMock is called more than once
      // within a reasonable timeframe after a single click.
      // Adjust the expected call count based on the exact intended behavior.
      // If it should be called exactly once per click, then expect(1).
      // If there's an initial call and then a loop, it will be > 1.
      expect(addJournalEntryMock).toHaveBeenCalledTimes(1);
    }, { timeout: 500 }); // Give it 500ms to see if more calls happen

    // After the initial wait, we can wait a bit longer and assert that no *further* calls occur.
    // This is a more robust way to check for "endless" entries.
    // We'll use a custom matcher or a negative assertion.
    // For simplicity, let's just check if it's still 1 after a longer wait.
    // If it's an infinite loop, this will likely timeout or fail with > 1.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for another second
    expect(addJournalEntryMock).toHaveBeenCalledTimes(1); // Should still be 1 if no loop
  });
});
