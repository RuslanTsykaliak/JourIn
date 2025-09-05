// app/utils/generatePromptText.ts

import { JournalEntries, CustomTitles } from "../types";
import { defaultPromptTemplate } from '../lib/promptTemplate';

export const generatePromptText = (
  entries: JournalEntries,
  customTitles?: CustomTitles,
  promptTemplate: string = defaultPromptTemplate
): string => {
  const defaultTitles: CustomTitles = {
    whatWentWell: "What went well today",
    whatILearned: "What I learned today",
    whatWouldDoDifferently: "What I would do differently",
    nextStep: "My next step",
  };

  const titles = { ...defaultTitles, ...customTitles };

  const filledEntries = Object.keys(entries)
    .filter((key) => {
      if (key === 'userGoal' || key.endsWith('_title')) {
        return false;
      }
      const value = entries[key];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return !!value;
    })
    .map((key) => {
      const title = entries[`${key}_title`] || titles[key] || key;
      const value = entries[key];
      return `${title}: ${value}`;
    })
    .join('\n\n');

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
