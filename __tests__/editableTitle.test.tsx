import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditableTitle from '../app/components/editableTitle';

describe('EditableTitle', () => {
  const initialValue = 'My Awesome Title';
  const placeholderText = 'Enter title here';
  const mockOnSave = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnFocus.mockClear();
    mockOnBlur.mockClear();
  });

  it('renders the initial value correctly', () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    expect(screen.getByText(initialValue)).toBeInTheDocument();
  });

  it('enters edit mode on double click', () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);
    expect(screen.getByDisplayValue(initialValue)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('saves new value on blur', async () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        onBlur={mockOnBlur}
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith('New Title');
    });
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(screen.getByText('New Title')).toBeInTheDocument();
  });

  it('saves new value on Enter key press', async () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Another Title' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith('Another Title');
    });
    expect(screen.getByText('Another Title')).toBeInTheDocument();
  });

  it('reverts to initial value on Escape key press', () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Temporary Change' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByText(initialValue)).toBeInTheDocument();
  });

  it('displays placeholder when initialValue is empty', () => {
    render(
      <EditableTitle
        initialValue=""
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    expect(screen.getByText(placeholderText)).toBeInTheDocument();
    expect(screen.getByText(placeholderText)).toHaveClass('italic');
  });

  it('displays placeholder when current value becomes empty after editing', async () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('');
    });
    expect(screen.getByText(placeholderText)).toBeInTheDocument();
    expect(screen.getByText(placeholderText)).toHaveClass('italic');
  });

  it('calls onFocus when input is focused', () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        onFocus={mockOnFocus}
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan); // This will focus the input
    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('does not save if value is unchanged on blur', async () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    // No change to input value
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText(initialValue)).toBeInTheDocument();
  });

  it('does not save if value is unchanged on Enter', async () => {
    render(
      <EditableTitle
        initialValue={initialValue}
        onSave={mockOnSave}
        fieldKey="testTitle"
        placeholder={placeholderText}
      />
    );
    const titleSpan = screen.getByText(initialValue);
    fireEvent.doubleClick(titleSpan);

    const input = screen.getByDisplayValue(initialValue) as HTMLInputElement;
    // No change to input value
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText(initialValue)).toBeInTheDocument();
  });
});
