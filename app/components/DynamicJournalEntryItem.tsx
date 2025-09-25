
"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { JournalEntryWithTimestamp } from '../types';
import JournalEntryItem from './journalEntryItem';
import JournalEntryItemDB from './journalEntryItemDB';

interface DynamicJournalEntryItemProps {
  entry: JournalEntryWithTimestamp;
}

const DynamicJournalEntryItem: React.FC<DynamicJournalEntryItemProps> = ({ entry }) => {
  const { data: session } = useSession();

  if (session) {
    return <JournalEntryItemDB entry={entry} />;
  } else {
    return <JournalEntryItem entry={entry} />;
  }
};

export default DynamicJournalEntryItem;
