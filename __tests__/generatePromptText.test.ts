import { generatePromptText } from '../app/utils/generatePromptText';
import { JournalEntries } from '../app/types';

describe('generatePromptText', () => {
  it('should include the journal entries in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'I successfully completed a major project.',
      whatILearned: 'I learned the importance of clear communication.',
      whatWouldDoDifferently: 'I would delegate more tasks to my team.',
      mySuccesses: 'I received positive feedback from the client.',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('I successfully completed a major project.');
    expect(prompt).toContain('I learned the importance of clear communication.');
    expect(prompt).toContain('I would delegate more tasks to my team.');
    expect(prompt).toContain('I received positive feedback from the client.');
  });

  it('should include key instructions in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'A test entry.',
      whatILearned: '',
      whatWouldDoDifferently: '',
      mySuccesses: '',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('end the post with 3-5 relevant and popular hashtags');
    expect(prompt).toContain('#ProfessionalGrowth #PersonalDevelopment #Reflection');
  });

  it('should throw an error for empty journal entries', () => {
    const entries: JournalEntries = {
      whatWentWell: '',
      whatILearned: '',
      whatWouldDoDifferently: '',
      mySuccesses: '',
    };

    expect(() => generatePromptText(entries)).toThrow(
      'Please fill out at least one journal entry to generate a prompt.'
    );
  });

  it('should handle special characters in the prompt', () => {
    const entries: JournalEntries = {
      whatWentWell: 'Project with @user & special chars like !@#$%^&*()_+',
      whatILearned: 'Learned about <script>alert("XSS")</script> vulnerabilities.',
      whatWouldDoDifferently: 'Use more emojis 😊👍🎉.',
      mySuccesses: 'Achieved 100% test coverage.',
    };

    const prompt = generatePromptText(entries);

    expect(prompt).toContain('Project with @user & special chars like !@#$%^&*()_+');
    expect(prompt).toContain('Learned about <script>alert("XSS")</script> vulnerabilities.');
    expect(prompt).toContain('Use more emojis 😊👍🎉.');
    expect(prompt).toContain('Achieved 100% test coverage.');
  });
});