import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';

describe('PromptInputSection save draft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save journal entries to localStorage and restore them on reload', async () => {
    const handlePromptGenerated = jest.fn();
    const { rerender } = render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.change(whatWentWellTextarea, { target: { value: 'I had a great day!' } });

    await waitFor(() => {
      const savedDraft = localStorage.getItem('jourin_current_draft');
      expect(savedDraft).not.toBeNull();
      const parsedDraft = JSON.parse(savedDraft as string);
      expect(parsedDraft.whatWentWell).toBe('I had a great day!');
    });

    // Simulate a reload by rerendering the component
    rerender(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    const whatWentWellTextareaAfterReload = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    expect(whatWentWellTextareaAfterReload).toHaveValue('I had a great day!');
  });
});
