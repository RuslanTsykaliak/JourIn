import { generateWeeklySummary, getStartOfWeek, getEndOfWeek } from '../../app/utils/weeklySummaryUtils';
import { JournalEntryWithTimestamp, defaultTitles } from '../../app/types';

describe('Weekly Summary Utils', () => {
  let weekStart: Date;
  let weekEnd: Date;

  beforeEach(() => {
    // Set up a consistent test week range
    const today = new Date();
    weekStart = getStartOfWeek(today);
    weekEnd = getEndOfWeek(today);
  });

  describe('generateWeeklySummary', () => {
    it('should return "No journal entries found for this week" when no entries exist', () => {
      const result = generateWeeklySummary([], weekStart, weekEnd);
      expect(result).toBe('No journal entries found for this week.');
    });

    it('should show only standard fields when they contain data', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000, // 1 day after week start
        whatWentWell: 'Had a productive day',
        whatILearned: 'Learned React hooks',
        whatWouldDoDifferently: 'Take more breaks',
        nextStep: 'Continue learning',
        customTitles: {},
        dynamicFields: {}
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('What went well today: Had a productive day');
      expect(result).toContain('What I learned today: Learned React hooks');
      expect(result).toContain('What I would do differently: Take more breaks');
      expect(result).toContain('What\'s my next step?: Continue learning');
      expect(result).toContain(new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    it('should show only custom fields when no standard fields have data', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {
          'Custom field': 'Custom entry',
          'Mood': 'Feeling great'
        }
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('Custom field: Custom entry');
      expect(result).toContain('Mood: Feeling great');
      expect(result).not.toContain('What went well today');
      expect(result).not.toContain('What I learned today');
    });

    it('should show mix of standard and custom fields when both have data', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Productive day',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {
          whatWentWell: 'Today\'s Achievement'
        },
        dynamicFields: {
          'custom-field': 'Custom data',
          'energy': 'High energy'
        }
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('Today\'s Achievement: Productive day');
      expect(result).toContain('custom-field: Custom data');
      expect(result).toContain('energy: High energy');
      expect(result).not.toContain('What I learned today');
    });

    it('should use custom titles for standard fields when provided', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Great achievement',
        whatILearned: 'New skill',
        whatWouldDoDifferently: 'Better approach',
        nextStep: 'Next action',
        customTitles: {
          whatWentWell: 'Today\'s Big Win',
          whatILearned: 'Knowledge Gained',
          whatWouldDoDifferently: 'Improvements Needed',
          nextStep: 'Action Item'
        },
        dynamicFields: {}
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('Today\'s Big Win: Great achievement');
      expect(result).toContain('Knowledge Gained: New skill');
      expect(result).toContain('Improvements Needed: Better approach');
      expect(result).toContain('Action Item: Next action');
      expect(result).not.toContain('What went well today');
      expect(result).not.toContain('What I learned today');
    });

    it('should use custom titles for dynamic fields when provided', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {
          'custom-field_title': 'My Custom Field',
          'mood_title': 'Current Mood'
        },
        dynamicFields: {
          'custom-field': 'Custom data',
          'mood': 'Happy'
        }
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('My Custom Field: Custom data');
      expect(result).toContain('Current Mood: Happy');
      expect(result).not.toContain('custom-field: Custom data');
      expect(result).not.toContain('mood: Happy');
    });

    it('should fall back to field names when custom titles are not provided', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {
          'custom-field': 'Custom data',
          'mood': 'Happy'
        }
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('custom-field: Custom data');
      expect(result).toContain('mood: Happy');
    });

    it('should handle multiple entries correctly', () => {
      const entry1: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Good day',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {}
      };

      const entry2: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + (86400000 * 2),
        whatWentWell: '',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {
          'Custom field': 'Custom entry'
        }
      };

      const result = generateWeeklySummary([entry1, entry2], weekStart, weekEnd);
      
      expect(result).toContain('What went well today: Good day');
      expect(result).toContain('Custom field: Custom entry');
      expect(result).toContain('---');
      expect(result).toContain(new Date(entry1.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      expect(result).toContain(new Date(entry2.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    it('should filter out entries outside the week range', () => {
      const entryInWeek: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Entry in week',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {}
      };

      const entryOutsideWeek: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() - 86400000, // 1 day before week start
        whatWentWell: 'Entry outside week',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: {}
      };

      const result = generateWeeklySummary([entryInWeek, entryOutsideWeek], weekStart, weekEnd);
      
      expect(result).toContain('Entry in week');
      expect(result).not.toContain('Entry outside week');
    });

    it('should handle empty string values correctly (should not show empty fields)', () => {
      const entry: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Non-empty value',
        whatILearned: '',
        whatWouldDoDifferently: '   ', // Whitespace only
        nextStep: 'Another non-empty',
        customTitles: {},
        dynamicFields: {
          'empty-field': '',
          'whitespace-field': '   ',
          'valid-field': 'Valid content'
        }
      };

      const result = generateWeeklySummary([entry], weekStart, weekEnd);
      
      expect(result).toContain('What went well today: Non-empty value');
      expect(result).toContain('What\'s my next step?: Another non-empty');
      expect(result).toContain('valid-field: Valid content');
      expect(result).not.toContain('What I learned today:');
      expect(result).not.toContain('What I would do differently:');
      expect(result).not.toContain('empty-field:');
      expect(result).not.toContain('whitespace-field:');
    });

    it('should handle null/undefined dynamicFields gracefully', () => {
      const entry1: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + 86400000,
        whatWentWell: 'Test entry',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: undefined
      };

      const entry2: JournalEntryWithTimestamp = {
        timestamp: weekStart.getTime() + (86400000 * 2),
        whatWentWell: 'Another test',
        whatILearned: '',
        whatWouldDoDifferently: '',
        nextStep: '',
        customTitles: {},
        dynamicFields: null as any
      };

      const result1 = generateWeeklySummary([entry1], weekStart, weekEnd);
      const result2 = generateWeeklySummary([entry2], weekStart, weekEnd);
      
      expect(result1).toContain('What went well today: Test entry');
      expect(result2).toContain('What went well today: Another test');
      expect(result1).not.toContain('undefined');
      expect(result2).not.toContain('null');
    });
  });

  describe('Date Utils', () => {
    it('should get start of week (Sunday)', () => {
      const testDate = new Date('2026-04-02'); // Thursday
      const startOfWeek = getStartOfWeek(testDate);
      
      expect(startOfWeek.getDay()).toBe(0); // Sunday
      expect(startOfWeek.getHours()).toBe(0);
      expect(startOfWeek.getMinutes()).toBe(0);
      expect(startOfWeek.getSeconds()).toBe(0);
    });

    it('should get end of week (Saturday)', () => {
      const testDate = new Date('2026-04-02'); // Thursday
      const endOfWeek = getEndOfWeek(testDate);
      
      expect(endOfWeek.getDay()).toBe(6); // Saturday
      expect(endOfWeek.getHours()).toBe(23);
      expect(endOfWeek.getMinutes()).toBe(59);
      expect(endOfWeek.getSeconds()).toBe(59);
    });
  });
});
