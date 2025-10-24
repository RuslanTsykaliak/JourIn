export const weeklyPromptTemplate = `
Based on my weekly summary of journal entries below, please generate a professional and engaging LinkedIn post.

The post should be a complete, seamless text, ready to be published. It must implicitly follow a "Hook → Re-hook → Body → CTA" structure, but do not label the sections.

Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

Crucially, end the post with 3-5 relevant and popular hashtags related to professional growth, reflection, or the topics in the journal entries.

Ensure:
- The post flows naturally as a single piece of text.
- No confidential or sensitive information is included.
- Avoid providing private details.
- Insights are actionable and relatable to a wide professional audience.
- The post is clear and engaging, with line breaks after every 1-2 sentences for maximum readability.
- Length: Around 40–120 words (excluding hashtags).

Here is my weekly summary:

{{weeklySummary}}

---
LinkedIn Post Structure Guidelines:
- Hook: A bold, emotional, or thought-provoking first line.
- Re-hook: A question or strong statement that encourages further reading.
- Body/Value: Specific insights, lessons learned, or details of success.
- CTA: End with an invitation to share their own related experience or opinion in the comments.
----

Please generate the LinkedIn post now.
`;