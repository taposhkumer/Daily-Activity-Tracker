"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, ImagePlus } from "lucide-react";
import Image from "next/image";

interface Goal {
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  period: "week" | "month" | "year";
}

interface GoalFormProps {
  period: "week" | "month" | "year";
  initialGoal?: Goal;
  onSubmit: (goal: Omit<Goal, "_id">) => Promise<void>;
  onCancel: () => void;
}

export default function GoalForm({
  period,
  initialGoal,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const [formData, setFormData] = useState<Omit<Goal, "_id">>({
    title: initialGoal?.title || "",
    description: initialGoal?.description || "",
    imageUrl: initialGoal?.imageUrl || "",
    period,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialGoal?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData((prev) => ({
        ...prev,
        imageUrl: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a goal title");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        period,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodLabel = {
    week: "This Week's Goal",
    month: "This Month's Goal",
    year: "This Year's Goal",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cyan-300">
            {initialGoal ? "Edit Goal" : `Add ${periodLabel[period]}`}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Goal Image (Optional)
            </label>

            {imagePreview ? (
              <div className="relative h-64 w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-40 rounded-lg border-2 border-dashed border-slate-600 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-center group"
              >
                <div className="text-center">
                  <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                </div>
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

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">
              Goal Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="What is your goal?"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              id="description"
              placeholder="Add details about your goal..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? "Saving..." : initialGoal ? "Update Goal" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
