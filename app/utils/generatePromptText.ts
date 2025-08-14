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

  const titles = customTitles || defaultTitles;

  if (!entries.whatWentWell && !entries.whatILearned && !entries.whatWouldDoDifferently && !entries.nextStep) {
    throw new Error("Please fill out at least one journal entry to generate a prompt.");
  }

  let goalSection = '';
  if (entries.userGoal) {
    goalSection = `

User's Goal for this post: ${entries.userGoal}. Please tailor the tone and content of the LinkedIn post to align with this goal, making it relevant and appealing to an audience that can help achieve it.`;
  }

  const populatedTemplate = promptTemplate
    .replace('{{whatWentWellTitle}}', titles.whatWentWell)
    .replace('{{whatWentWell}}', entries.whatWentWell)
    .replace('{{whatILearnedTitle}}', titles.whatILearned)
    .replace('{{whatILearned}}', entries.whatILearned)
    .replace('{{whatWouldDoDifferentlyTitle}}', titles.whatWouldDoDifferently)
    .replace('{{whatWouldDoDifferently}}', entries.whatWouldDoDifferently)
    .replace('{{nextStepTitle}}', titles.nextStep)
    .replace('{{nextStep}}', entries.nextStep)
    .replace('{{goalSection}}', goalSection);

  return populatedTemplate;
};