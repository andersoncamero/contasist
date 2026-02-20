import React from "react";
import { JournalEntry } from "../entities/JournalEntry";

export const useJournalEntry = () => {
  const [entries, setEntries] = React.useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("contasist_journal");
    return saved ? JSON.parse(saved) : [];
  });

  const addEntry = async (entry: Omit<JournalEntry, "ID" | "CreatedAt">) => {
    const newEntry: JournalEntry = {
      ...entry,
      ID: Math.random().toString(36).substr(2, 9),
      CreatedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("contasist_journal", JSON.stringify(updated));
  };

  return {
    entries,
    addEntry,
    isLoading: false,
  };
};
