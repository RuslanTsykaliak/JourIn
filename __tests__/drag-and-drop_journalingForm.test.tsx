import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DragEndEvent } from '@dnd-kit/core';
import JournalingForm from '../app/components/DEV_journalingForm';
import { JournalEntries, CustomTitles } from '../app/types';

// Mock the useReward hook
jest.mock('../app/hooks/useReward', () => ({
  useReward: () => ({
    showReward: jest.fn(),
  }),
}));

// Extend Window interface to include our test handler
declare global {
  interface Window {
    __testDragEnd?: (event: DragEndEvent) => void;
  }
}

// Mock @dnd-kit to allow us to test the drag end handler
jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (event: DragEndEvent) => void }) => {
      // Expose the onDragEnd handler for testing
      window.__testDragEnd = onDragEnd;
      return <div>{children}</div>;
    },
  };
});

describe('Drag and Drop Journaling Form', () => {
  const mockJournalEntries: JournalEntries = {
    whatWentWell: 'Well',
    whatILearned: 'Learned',
    whatWouldDoDifferently: 'Differently',
    nextStep: 'Next',
  };

  const mockCustomTitles: CustomTitles = {
    whatWentWell: 'What went well today?',
    whatILearned: 'What did I learn today?',
    whatWouldDoDifferently: 'What would I do differently?',
    nextStep: "What's my next step?",
  };

  const mockOnJournalEntriesChange = jest.fn();
  const mockOnCustomTitleChange = jest.fn();
  const mockSetAdditionalFields = jest.fn();

  // Helper to create a mock ClientRect
  const createMockClientRect = (): ClientRect => ({
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    bottom: 50,
    right: 100,
    x: 0,
    y: 0,
    toJSON: function () {
      throw new Error('Function not implemented.');
    }
  });

  // Helper to create a mock drag end event
  const createDragEndEvent = (activeId: string, overId: string | null): DragEndEvent => ({
    active: {
      id: activeId,
      data: { current: undefined },
      rect: { current: { initial: createMockClientRect(), translated: createMockClientRect() } },
    },
    over: overId ? {
      id: overId,
      data: { current: undefined },
      rect: createMockClientRect(),
      disabled: false,
    } : null,
    delta: { x: 0, y: 0 },
    collisions: null,
    activatorEvent: new MouseEvent('mousedown') as Event,
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    delete window.__testDragEnd;
  });

  it('should reorder items on drag and drop and save to local storage', async () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={mockOnJournalEntriesChange}
        customTitles={mockCustomTitles}
        onCustomTitleChange={mockOnCustomTitleChange}
        additionalFields={[]}
        setAdditionalFields={mockSetAdditionalFields}
      />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('sortable-item-whatWentWell')).toBeInTheDocument();
    });

    // Verify initial order
    const textboxesBefore = screen.getAllByRole('textbox');
    expect(textboxesBefore[0]).toHaveValue('Well');
    expect(textboxesBefore[1]).toHaveValue('Learned');

    // Simulate a drag end event (moving first item to second position)
    const dragEndHandler = window.__testDragEnd;
    expect(dragEndHandler).toBeDefined();

    if (dragEndHandler) {
      dragEndHandler(createDragEndEvent('whatWentWell', 'whatILearned'));
    }

    // Wait for the DOM to update after the drag
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes[0]).toHaveValue('Learned');
      expect(textboxes[1]).toHaveValue('Well');
      expect(textboxes[2]).toHaveValue('Differently');
      expect(textboxes[3]).toHaveValue('Next');
    });

    // Check that local storage was updated with the new order
    const savedOrder = JSON.parse(localStorage.getItem('jourin_dnd_order') || '[]');
    expect(savedOrder).toEqual(['whatILearned', 'whatWentWell', 'whatWouldDoDifferently', 'nextStep']);
  });

  it('should restore saved order from localStorage on mount', async () => {
    // Set a custom order in localStorage
    const customOrder = ['nextStep', 'whatWentWell', 'whatILearned', 'whatWouldDoDifferently'];
    localStorage.setItem('jourin_dnd_order', JSON.stringify(customOrder));

    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={mockOnJournalEntriesChange}
        customTitles={mockCustomTitles}
        onCustomTitleChange={mockOnCustomTitleChange}
        additionalFields={[]}
        setAdditionalFields={mockSetAdditionalFields}
      />
    );

    // Verify the order matches localStorage
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes[0]).toHaveValue('Next');
      expect(textboxes[1]).toHaveValue('Well');
      expect(textboxes[2]).toHaveValue('Learned');
      expect(textboxes[3]).toHaveValue('Differently');
    });
  });

  it('should handle dragging to same position (no change)', async () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={mockOnJournalEntriesChange}
        customTitles={mockCustomTitles}
        onCustomTitleChange={mockOnCustomTitleChange}
        additionalFields={[]}
        setAdditionalFields={mockSetAdditionalFields}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('sortable-item-whatWentWell')).toBeInTheDocument();
    });

    // Simulate dragging to same position
    const dragEndHandler = window.__testDragEnd;

    if (dragEndHandler) {
      dragEndHandler(createDragEndEvent('whatWentWell', 'whatWentWell'));
    }

    // Order should remain the same
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes[0]).toHaveValue('Well');
      expect(textboxes[1]).toHaveValue('Learned');
    });
  });

  it('should handle drag with no over target', async () => {
    render(
      <JournalingForm
        journalEntries={mockJournalEntries}
        onJournalEntriesChange={mockOnJournalEntriesChange}
        customTitles={mockCustomTitles}
        onCustomTitleChange={mockOnCustomTitleChange}
        additionalFields={[]}
        setAdditionalFields={mockSetAdditionalFields}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('sortable-item-whatWentWell')).toBeInTheDocument();
    });

    // Simulate dragging with no drop target
    const dragEndHandler = window.__testDragEnd;

    if (dragEndHandler) {
      dragEndHandler(createDragEndEvent('whatWentWell', null));
    }

    // Order should remain the same
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes[0]).toHaveValue('Well');
      expect(textboxes[1]).toHaveValue('Learned');
    });
  });
});