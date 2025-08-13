import { generatePromptText } from '../app/utils/generatePromptText';
import { JournalEntries } from '../app/types';

describe('generatePromptText', () => {
  it('should include the journal entries in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'I successfully completed a major project.',
      whatILearned: 'I learned the importance of clear communication.',
      whatWouldDoDifferently: 'I would delegate more tasks to my team.',
      nextStep: 'I will work on the core feature of my app.',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('I successfully completed a major project.');
    expect(prompt).toContain('I learned the importance of clear communication.');
    expect(prompt).toContain('I would delegate more tasks to my team.');
    expect(prompt).toContain('I will work on the core feature of my app.');
  });

  it('should include key instructions in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'A test entry.',
      whatILearned: '',
      whatWouldDoDifferently: '',
      nextStep: '',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('end the post with 3-5 relevant and popular hashtags');
  });

  it('should throw an error for empty journal entries', () => {
    const entries: JournalEntries = {
      whatWentWell: '',
      whatILearned: '',
      whatWouldDoDifferently: '',
      nextStep: '',
    };

    expect(() => generatePromptText(entries, { type: '', specifics: '' })).toThrow(
      'Please fill out at least one journal entry to generate a prompt.'
    );
  });

  it('should handle special characters in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'Project with @user & special chars like !@#$%^&*()_+',
      whatILearned: 'Learned about <script>alert("XSS")</script> vulnerabilities.',
      whatWouldDoDifferently: 'Use more emojis 😊👍🎉.',
      nextStep: 'Achieved 100% test coverage.',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('Project with @user & special chars like !@#$%^&*()_+');
    expect(prompt).toContain('Learned about <script>alert("XSS")</script> vulnerabilities.');
    expect(prompt).toContain('Use more emojis 😊👍🎉.');
    expect(prompt).toContain('Achieved 100% test coverage.');
  });
});