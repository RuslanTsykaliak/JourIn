import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'; // Import userEvent
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('PromptInputSection', () => {
  // Mock the global fetch function
  const mockFetch = jest.fn();
  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    mockFetch.mockClear();
    // Mock a successful response for the generate API call
    mockFetch.mockImplementation((url) => {
      if (url === '/api/generate') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ generatedText: 'Generated content' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });
    // Default mock for useSession to be unauthenticated
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('should allow users to edit journal entry titles via inline editing', async () => {
    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Initial titles should be present
    expect(screen.getByText('What went well today?')).toBeInTheDocument();
    expect(screen.getByText('What did I learn today?')).toBeInTheDocument();
    expect(screen.getByText('What would I do differently?')).toBeInTheDocument();
    expect(screen.getByText('What’s my next step?')).toBeInTheDocument();

    // Simulate double-clicking on a title to activate editing mode
    const whatWentWellTitle = screen.getByText('What went well today?');
    fireEvent.doubleClick(whatWentWellTitle);

    // Check if input field appears with current title
    // Use getByRole('textbox') with the specific aria-label
    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i });
    expect(inputWhatWentWell).toBeInTheDocument();
    expect(inputWhatWentWell).toHaveValue('What went well today?'); // Verify its initial value

    // Change the title
    fireEvent.change(inputWhatWentWell, { target: { value: 'My Wins:' } });

    // Simulate blurring the input field to trigger save
    fireEvent.blur(inputWhatWentWell);

    // Wait for the new title to appear and old one to disappear
    await waitFor(() => {
      expect(screen.getByText('My Wins:')).toBeInTheDocument();
      expect(screen.queryByText('What went well today?')).not.toBeInTheDocument();
    });

    // Ensure other titles are still present
    expect(screen.getByText('What did I learn today?')).toBeInTheDocument();
    expect(screen.getByText('What would I do differently?')).toBeInTheDocument();
    expect(screen.getByText('What’s my next step?')).toBeInTheDocument();

    // Test another title
    const whatILearnedTitle = screen.getByText('What did I learn today?');
    fireEvent.doubleClick(whatILearnedTitle);
    const inputWhatILearned = screen.getByRole('textbox', { name: /edit what did i learn today?/i });
    expect(inputWhatILearned).toBeInTheDocument();
    expect(inputWhatILearned).toHaveValue('What did I learn today?');

    fireEvent.change(inputWhatILearned, { target: { value: 'New Knowledge:' } });
    fireEvent.blur(inputWhatILearned);

    await waitFor(() => {
      expect(screen.getByText('New Knowledge:')).toBeInTheDocument();
      expect(screen.queryByText('What did I learn today?')).not.toBeInTheDocument();
    });
  });

  it('Generate Post button does not double journal entries', async () => {
    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    // Find the initial number of textareas
    const initialTextareas = screen.getAllByRole('textbox');
    expect(initialTextareas.length).toBeGreaterThan(0);
    const initialCount = initialTextareas.length;

    // Type into one of the textareas
    await user.type(initialTextareas[0], 'This is a test entry.');

    // Click the Generate Post button
    const generateButton = screen.getByRole('button', { name: /generate post/i });
    await user.click(generateButton);

    // Wait for the API call to resolve and UI to update
    await waitFor(() => {
      expect(handlePromptGenerated).toHaveBeenCalledWith(
        expect.any(String), // The generated prompt string
        expect.objectContaining({
          whatWentWell: 'This is a test entry.',
          whatILearned: '',
          whatWouldDoDifferently: '',
          nextStep: '',
        }),
        expect.objectContaining({
          whatWentWell: 'What went well today?',
          whatILearned: 'What did I learn today?',
          whatWouldDoDifferently: 'What would I do differently?',
          nextStep: 'What’s my next step?',
        })
      );
    });

    // Assert that the number of textareas has not changed (no doubling)
    const finalTextareas = screen.getAllByRole('textbox');
    expect(finalTextareas.length).toBe(initialCount);
  });

  it('should generate prompt correctly for non-auth user with only default entry and no custom fields', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    const whatWentWellTextarea = screen.getByLabelText(/What went well today?/i);
    await user.type(whatWentWellTextarea, 'Today was a great day!');

    const generateButton = screen.getByRole('button', { name: /generate post/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(handlePromptGenerated).toHaveBeenCalledTimes(1);
      const [prompt, entry, customTitles] = handlePromptGenerated.mock.calls[0];
      expect(prompt).toContain('What went well today?: Today was a great day!');
      expect(prompt).not.toContain('customField_0:');
      expect(entry.whatWentWell).toBe('Today was a great day!');
      expect(entry.customField_0).toBeUndefined();
    });
  });
});