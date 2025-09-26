import { JournalEntries, CustomTitles, defaultTitles } from "../types";
import { defaultPromptTemplate } from '../lib/promptTemplate';

export const generatePromptTextDB = (
  entries: JournalEntries,
  customTitles?: CustomTitles,
  promptTemplate: string = defaultPromptTemplate
): string => {

  const titles = { ...defaultTitles, ...customTitles };

  const filledEntries = entries.dynamicFields
    ? Object.keys(entries.dynamicFields)
      .map((key) => {
        const title = titles[key] || key;
        const value = entries.dynamicFields![key]; // Use non-null assertion as we've checked for existence
        return `${title}: ${value}`;
      })
      .join('\n\n')
    : '';

  if (!filledEntries) {
    throw new Error("Please fill out at least one journal entry to generate a prompt.");
  }

  let goalSection = '';
  if (entries.userGoal) {
    goalSection = `

User's Goal for this post: ${entries.userGoal}. Please tailor the tone and content of the LinkedIn post to align with this goal, making it relevant and appealing to an audience that can help achieve it.`;
  }

  let populatedTemplate = promptTemplate
    .replace(/{{journalEntries}}/g, filledEntries)
    .replace(/{{goalSection}}/g, goalSection);

  for (const key in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      const value = entries[key];
      if (typeof value === 'string') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        populatedTemplate = populatedTemplate.replace(regex, value);
      }
    }
  }

  return populatedTemplate;
};