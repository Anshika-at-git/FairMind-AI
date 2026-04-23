"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AuditRecord = {
  id: string;
  timestamp: number;
  type: "Text Bias" | "Model Output" | "Dataset Fairness";
  title: string;
  riskLevel?: "Low" | "Medium" | "High";
  biasCategories?: string[];
  isBiased?: boolean;
  fairnessScore?: number;
};

type HistoryContextType = {
  history: AuditRecord[];
  addRecord: (record: Omit<AuditRecord, "id" | "timestamp">) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("fairmind_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever history changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("fairmind_history", JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const addRecord = (record: Omit<AuditRecord, "id" | "timestamp">) => {
    const newRecord: AuditRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newRecord, ...prev].slice(0, 50)); // Keep last 50 records
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("fairmind_history");
  };

  return (
    <HistoryContext.Provider value={{ history, addRecord, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
