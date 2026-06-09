"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import NoteEditor from "./NoteEditor";

interface Note {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  period: "week" | "month" | "year";
}

interface NotesClientProps {
  initialNotes: Note[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeTab, setActiveTab] = useState<"week" | "month" | "year">("week");

  const getOrCreateNote = (period: "week" | "month" | "year"): Note => {
    const existing = notes.find((n) => n.period === period);
    if (existing) return existing;

    // Return a template for new note (unsaved)
    return {
      _id: `temp-${period}`,
      title: {
        week: "This Week's Goals",
        month: "This Month's Goals",
        year: "This Year's Goals",
      }[period],
      content: "",
      imageUrl: "",
      period,
    };
  };

  const handleSaveNote = useCallback(
    async (note: Note) => {
      try {
        if (note._id.startsWith("temp-")) {
          // Create new note
          const response = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              period: note.period,
              imageUrl: note.imageUrl,
            }),
          });

          if (!response.ok) throw new Error("Failed to create note");
          const data = await response.json();
          setNotes((prev) => [
            ...prev.filter((n) => !n._id.startsWith("temp-")),
            data.note,
          ]);
        } else {
          // Update existing note
          const response = await fetch("/api/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: note._id,
              title: note.title,
              content: note.content,
              imageUrl: note.imageUrl,
            }),
          });

          if (!response.ok) throw new Error("Failed to update note");
          const data = await response.json();
          setNotes((prev) => prev.map((n) => (n._id === data.note._id ? data.note : n)));
        }
      } catch (error) {
        console.error("Error saving note:", error);
        alert("Error saving note");
        throw error;
      }
    },
    []
  );

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note");
      throw error;
    }
  }, []);

  const weekNote = getOrCreateNote("week");
  const monthNote = getOrCreateNote("month");
  const yearNote = getOrCreateNote("year");

  const tabs = [
    { id: "week", label: "📅 This Week", emoji: "📅", note: weekNote },
    { id: "month", label: "📊 This Month", emoji: "📊", note: monthNote },
    { id: "year", label: "🎆 This Year", emoji: "🎆", note: yearNote },
  ] as const;

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-6">
        <h1 className="text-4xl font-bold text-slate-100">📝 Goals & Notes</h1>
        <p className="text-slate-400 mt-2">Write your goals and notes for different time periods</p>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "week" | "month" | "year")}
            className={`px-6 py-3 font-medium rounded-t-lg transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-cyan-600/20 text-cyan-300 border-b-2 border-cyan-500"
                : "bg-slate-900/40 text-slate-400 hover:text-slate-300 hover:bg-slate-900/60"
            }`}
          >
            <span className="text-lg">{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {currentTab && (
            <NoteEditor
              note={currentTab.note}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
