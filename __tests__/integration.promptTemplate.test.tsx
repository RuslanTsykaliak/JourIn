import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';

describe('PromptInputSection with custom prompt template', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should use a custom prompt template when provided', async () => {
    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Assume there is a button to open the prompt editor
    const customizeButton = screen.getByRole('button', { name: /customize prompt/i });
    fireEvent.click(customizeButton);

    const newTemplate = 'My custom template: {whatWentWell}';
    const textarea = screen.getByRole('textbox', { name: /prompt template/i });
    fireEvent.change(textarea, { target: { value: newTemplate } });

    const saveButton = screen.getByRole('button', { name: /save template/i });
    fireEvent.click(saveButton);

    // Fill in a journal entry
    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.change(whatWentWellTextarea, { target: { value: 'I learned to code!' } });

    // Generate the prompt
    const generateButton = screen.getByRole('button', { name: /generate post prompt/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(handlePromptGenerated).toHaveBeenCalledWith(
        'My custom template: I learned to code!',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
