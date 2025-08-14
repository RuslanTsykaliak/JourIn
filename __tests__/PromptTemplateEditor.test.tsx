import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptTemplateEditor from '../app/components/promptTemplateEditor';
import '@testing-library/jest-dom';

const DEFAULT_PROMPT_TEMPLATE = `This is a default prompt template.`;

describe('PromptTemplateEditor', () => {
  it('should render with the default prompt template', () => {
    const handleSave = jest.fn();
    const handleReset = jest.fn();

    render(
      <PromptTemplateEditor
        template={DEFAULT_PROMPT_TEMPLATE}
        onSave={handleSave}
        onReset={handleReset}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(DEFAULT_PROMPT_TEMPLATE);
  });

  it('should allow the user to edit and save the template', () => {
    const handleSave = jest.fn();
    const handleReset = jest.fn();
    const newTemplate = 'This is a new prompt template.';

    render(
      <PromptTemplateEditor
        template={DEFAULT_PROMPT_TEMPLATE}
        onSave={handleSave}
        onReset={handleReset}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: newTemplate } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith(newTemplate);
  });

  it('should call the onReset handler when the reset button is clicked', () => {
    const handleSave = jest.fn();
    const handleReset = jest.fn();

    render(
      <PromptTemplateEditor
        template={DEFAULT_PROMPT_TEMPLATE}
        onSave={handleSave}
        onReset={handleReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(handleReset).toHaveBeenCalled();
  });
});
