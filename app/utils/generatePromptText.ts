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
    .replace(/{{whatWentWellTitle}}/g, titles.whatWentWell)
    .replace(/{{whatWentWell}}/g, entries.whatWentWell)
    .replace(/{{whatILearnedTitle}}/g, titles.whatILearned)
    .replace(/{{whatILearned}}/g, entries.whatILearned)
    .replace(/{{whatWouldDoDifferentlyTitle}}/g, titles.whatWouldDoDifferently)
    .replace(/{{whatWouldDoDifferently}}/g, entries.whatWouldDoDifferently)
    .replace(/{{nextStepTitle}}/g, titles.nextStep)
    .replace(/{{nextStep}}/g, entries.nextStep)
    .replace(/{{goalSection}}/g, goalSection);

  return populatedTemplate;
};