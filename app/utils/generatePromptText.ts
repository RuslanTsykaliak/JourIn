// app/utils/generatePromptText.ts

import { JournalEntries } from "../types";

export const generatePromptText = (entries: JournalEntries): string => {
  if (!entries.whatWentWell && !entries.whatILearned && !entries.whatWouldDoDifferently && !entries.mySuccesses) {
    throw new Error("Please fill out at least one journal entry to generate a prompt.");
  }

  return `
    Based on the following journal entries, please generate a professional and engaging LinkedIn post.

    The post should be a complete, seamless text, ready to be published. It should implicitly follow a "Hook → Body → CTA" structure, but do not label the sections.

    Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

    **Crucially, end the post with 3-5 relevant and popular hashtags related to professional growth, reflection, or the topics in the journal entries.**

    Ensure:
    - The post flows naturally as a single piece of text.
    - No confidential or sensitive information is included.
    - Avoid providing private details.
    - Insights are actionable and relatable to a wide professional audience.
    - The post is clear and engaging, with short paragraphs and line breaks.
    - Length: Around 40–120 words (excluding hashtags).

    Here are the journal entries:

    What went well: ${entries.whatWentWell}

    What I learned: ${entries.whatILearned}

    What I would do differently: ${entries.whatWouldDoDifferently}

    My successes: ${entries.mySuccesses}

    ---
    LinkedIn Post Structure Guidelines:
    - Hook: A bold, emotional, or thought-provoking first line.
    - Re-hook: A question or strong statement that encourages further reading.
    - Body/Value: Specific insights, lessons learned, or details of success.
    - CTA: End with an invitation for comments, shares, or discussion.
    ---

    Please generate the LinkedIn post now.
  `;
};