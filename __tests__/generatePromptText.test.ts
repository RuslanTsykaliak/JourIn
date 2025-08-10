import { generatePromptText } from '../app/utils/generatePromptText';
import { JournalEntries } from '../app/types';

describe('generatePromptText', () => {
  it('should generate the correct prompt text based on journal entries', () => {
    const entries: JournalEntries = {
      whatWentWell: 'I successfully completed a major project.',
      whatILearned: 'I learned the importance of clear communication.',
      whatWouldDoDifferently: 'I would delegate more tasks to my team.',
      mySuccesses: 'I received positive feedback from the client.',
    };

    const expectedText = `
    Based on the following journal entries, please generate a professional LinkedIn post.
    
    The post should follow a "Hook → Re-hook → Body/Value → CTA" structure to maximize engagement.

    Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

    Ensure:
    - No confidential or sensitive information is included.
    - Insights are actionable and relatable to a wide professional audience.
    - The post is clear and engaging, with short paragraphs and line breaks.
    - Length: Around 40–120 words.

    Here are the journal entries:

    What went well: I successfully completed a major project.

    What I learned: I learned the importance of clear communication.

    What I would do differently: I would delegate more tasks to my team.

    My successes: I received positive feedback from the client.

    ---
    LinkedIn Post Structure Guidelines:
    - Hook: A bold, emotional, or thought-provoking first line.
    - Re-hook: A question or strong statement that encourages further reading.
    - Body/Value: Specific insights, lessons learned, or details of success.
    - CTA: End with an invitation for comments, shares, or discussion.
    ---

    Please generate the LinkedIn post now.
  `;

    expect(generatePromptText(entries)).toBe(expectedText);
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

  it('should handle long journal entries', () => {
    const entries: JournalEntries = {
      whatWentWell: 'a'.repeat(500),
      whatILearned: 'b'.repeat(500),
      whatWouldDoDifferently: 'c'.repeat(500),
      mySuccesses: 'd'.repeat(500),
    };

    const expectedText = `
    Based on the following journal entries, please generate a professional LinkedIn post.
    
    The post should follow a "Hook → Re-hook → Body/Value → CTA" structure to maximize engagement.

    Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

    Ensure:
    - No confidential or sensitive information is included.
    - Insights are actionable and relatable to a wide professional audience.
    - The post is clear and engaging, with short paragraphs and line breaks.
    - Length: Around 40–120 words.

    Here are the journal entries:

    What went well: ${'a'.repeat(500)}

    What I learned: ${'b'.repeat(500)}

    What I would do differently: ${'c'.repeat(500)}

    My successes: ${'d'.repeat(500)}

    ---
    LinkedIn Post Structure Guidelines:
    - Hook: A bold, emotional, or thought-provoking first line.
    - Re-hook: A question or strong statement that encourages further reading.
    - Body/Value: Specific insights, lessons learned, or details of success.
    - CTA: End with an invitation for comments, shares, or discussion.
    ---

    Please generate the LinkedIn post now.
  `;

    expect(generatePromptText(entries)).toBe(expectedText);
  });

  it('should handle journal entries with special characters', () => {
    const entries: JournalEntries = {
      whatWentWell: 'Project with @user & special chars like !@#$%^&*()_+',
      whatILearned: 'Learned about <script>alert("XSS")</script> vulnerabilities.',
      whatWouldDoDifferently: 'Use more emojis 😊👍🎉.',
      mySuccesses: 'Achieved 100% test coverage.',
    };

    const expectedText = `
    Based on the following journal entries, please generate a professional LinkedIn post.
    
    The post should follow a "Hook → Re-hook → Body/Value → CTA" structure to maximize engagement.

    Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

    Ensure:
    - No confidential or sensitive information is included.
    - Insights are actionable and relatable to a wide professional audience.
    - The post is clear and engaging, with short paragraphs and line breaks.
    - Length: Around 40–120 words.

    Here are the journal entries:

    What went well: Project with @user & special chars like !@#$%^&*()_+

    What I learned: Learned about <script>alert("XSS")</script> vulnerabilities.

    What I would do differently: Use more emojis 😊👍🎉.

    My successes: Achieved 100% test coverage.

    ---
    LinkedIn Post Structure Guidelines:
    - Hook: A bold, emotional, or thought-provoking first line.
    - Re-hook: A question or strong statement that encourages further reading.
    - Body/Value: Specific insights, lessons learned, or details of success.
    - CTA: End with an invitation for comments, shares, or discussion.
    ---

    Please generate the LinkedIn post now.
  `;

    expect(generatePromptText(entries)).toBe(expectedText);
  });
});
