"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface Note {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  period: "week" | "month" | "year";
}

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const [content, setContent] = useState(note.content);
  const [imageUrl, setImageUrl] = useState(note.imageUrl || "");
  const [imagePreview, setImagePreview] = useState<string | null>(note.imageUrl || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setImageUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        ...note,
        content,
        imageUrl,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      setIsDeleting(true);
      await onDelete(note._id);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const periodEmoji = {
    week: "📅",
    month: "📊",
    year: "🎆",
  };

  if (!isEditing) {
    return (
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all h-full flex flex-col">
        {/* Image Display */}
        {imagePreview && (
          <div className="relative h-64 w-full bg-slate-800 shrink-0">
            <Image
              src={imagePreview}
              alt="Note"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2 sticky top-0">
            <span>{periodEmoji[note.period as keyof typeof periodEmoji]}</span>
            {note.title}
          </h3>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
              {content || "No content"}
            </p>
          </div>
        </div>

        {/* Edit/Delete Buttons */}
        <div className="flex gap-2 p-6 border-t border-slate-700/50 bg-slate-900/30 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-4 py-3 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/80 border-2 border-cyan-500/50 rounded-xl overflow-hidden p-6 space-y-6 h-full flex flex-col"
    >
      {/* Image Edit */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">Image (Optional)</label>

        {imagePreview ? (
          <div className="relative h-48 w-full bg-slate-800 rounded-lg overflow-hidden shrink-0">
            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-40 rounded-lg border-2 border-dashed border-slate-600 hover:border-cyan-500 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <ImagePlus className="w-8 h-8 text-slate-400 hover:text-cyan-400" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Content Textarea */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here..."
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none font-mono text-sm"
        />
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-2 pt-4 shrink-0">
        <button
          onClick={() => {
            setIsEditing(false);
            setContent(note.content);
            setImageUrl(note.imageUrl || "");
            setImagePreview(note.imageUrl || null);
          }}
          className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </motion.div>
  );
}
