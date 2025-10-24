import { generateWeeklySummary } from '../app/utils/weeklySummaryUtils';
import { weeklyPromptTemplate } from '../app/lib/weeklyPromptTemplate';
import { JournalEntryWithTimestamp, defaultTitles } from '../app/types';

describe('generateWeeklyPrompt', () => {
  it('should generate a weekly prompt with the summary embedded', () => {
    const entries: JournalEntryWithTimestamp[] = [
      {
        timestamp: new Date('2024-01-01T12:00:00.000Z').getTime(),
        whatWentWell: 'I completed a major project.',
        whatILearned: 'I learned how to use a new framework.',
        whatWouldDoDifferently: 'I would have started earlier.',
        nextStep: 'I will apply this knowledge to the next project.',
        customTitles: defaultTitles,
      },
    ];

    const startOfWeek = new Date('2024-01-01T00:00:00.000Z');
    const endOfWeek = new Date('2024-01-07T23:59:59.999Z');

    const summary = generateWeeklySummary(entries, startOfWeek, endOfWeek);
    const prompt = weeklyPromptTemplate.replace('{{weeklySummary}}', summary);

    expect(prompt).toContain('I completed a major project.');
    expect(prompt).toContain('I learned how to use a new framework.');
    expect(prompt).toContain('I would have started earlier.');
    expect(prompt).toContain('I will apply this knowledge to the next project.');
  });
});
