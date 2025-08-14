// app/lib/promptTemplate.ts

export const defaultPromptTemplate = `
Based on my daily journal entries below, please generate a professional and engaging LinkedIn post.

The post should be a complete, seamless text, ready to be published. It should implicitly follow a "Hook → Re-hook → Body → CTA" structure, but do not label the sections.

Tone: Reflective, inspiring, and professional. Write as if sharing a personal growth moment with fellow professionals.

Crucially, end the post with 3-5 relevant and popular hashtags related to professional growth, reflection, or the topics in the journal entries.

Ensure:
- The post flows naturally as a single piece of text.
- No confidential or sensitive information is included.
- Avoid providing private details.
- Insights are actionable and relatable to a wide professional audience.
- The post is clear and engaging, with short paragraphs and line breaks.
- Length: Around 40–120 words (excluding hashtags).

Here are my journal entries for today:

{{whatWentWellTitle}}: {{whatWentWell}}

{{whatILearnedTitle}}: {{whatILearned}}

{{whatWouldDoDifferentlyTitle}}: {{whatWouldDoDifferently}}

{{nextStepTitle}}: {{nextStep}}
{{goalSection}}
---
LinkedIn Post Structure Guidelines:
- Hook: A bold, emotional, or thought-provoking first line.
- Re-hook: A question or strong statement that encourages further reading.
- Body/Value: Specific insights, lessons learned, or details of success.
- CTA: End with an invitation for comments, shares, or discussion.
----

Please generate the LinkedIn post now.
`;
