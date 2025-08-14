import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptTemplateEditor from '../app/components/promptTemplateEditor';
import '@testing-library/jest-dom';
import { defaultPromptTemplate } from '../app/lib/promptTemplate';

describe('PromptTemplateEditor', () => {
  it('should render with the initial template', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();

    render(
      <PromptTemplateEditor
        initialTemplate={defaultPromptTemplate}
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(defaultPromptTemplate);
  });

  it('should allow the user to edit and save the template', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();
    const newTemplate = 'This is a new prompt template.';

    render(
      <PromptTemplateEditor
        initialTemplate={defaultPromptTemplate}
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: newTemplate } });

    const saveButton = screen.getByRole('button', { name: /save template/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith(newTemplate);
    expect(handleClose).toHaveBeenCalled();
  });

  it('should reset the template to the default', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();

    render(
      <PromptTemplateEditor
        initialTemplate="A custom template"
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset to default/i });
    fireEvent.click(resetButton);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(defaultPromptTemplate);
  });

  it('should call onClose when the close button is clicked', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();

    render(
      <PromptTemplateEditor
        initialTemplate={defaultPromptTemplate}
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when the cancel button is clicked', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();

    render(
      <PromptTemplateEditor
        initialTemplate={defaultPromptTemplate}
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });
});