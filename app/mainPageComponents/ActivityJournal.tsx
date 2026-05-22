"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ActivityJournalStore,
  type DayEntry,
  formatDateKey,
  formatDayLabel,
  getRecentDays,
  loadJournal,
  readImageAsDataUrl,
  saveJournal,
} from "@/lib/activityJournal";

type ActivityJournalProps = {
  userId: string;
};

export default function ActivityJournal({ userId }: ActivityJournalProps) {
  const recentDays = getRecentDays(7);
  const todayKey = formatDateKey(recentDays[0]);

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [store, setStore] = useState<ActivityJournalStore>({});
  const [note, setNote] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadJournal(userId);
    setStore(loaded);
    setIsHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!isHydrated) return;

    const entry = store[selectedDateKey] ?? { note: "", imageDataUrl: undefined };
    setNote(entry.note);
    setImageDataUrl(entry.imageDataUrl);
  }, [selectedDateKey, store, isHydrated]);

  const persistEntry = useCallback(
    (dateKey: string, entry: DayEntry) => {
      setStore((prev) => {
        const next = { ...prev, [dateKey]: entry };
        if (!entry.note.trim() && !entry.imageDataUrl) {
          delete next[dateKey];
        }
        saveJournal(userId, next);
        return next;
      });
    },
    [userId],
  );

  const handleNoteBlur = () => {
    persistEntry(selectedDateKey, { note, imageDataUrl });
    setStatus("Note saved");
    setTimeout(() => setStatus(null), 2000);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setImageDataUrl(dataUrl);
      persistEntry(selectedDateKey, { note, imageDataUrl: dataUrl });
      setStatus("Image added");
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not add image");
    }

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImageDataUrl(undefined);
    persistEntry(selectedDateKey, { note, imageDataUrl: undefined });
    setStatus("Image removed");
    setTimeout(() => setStatus(null), 2000);
  };

  const selectedIndex = recentDays.findIndex(
    (d) => formatDateKey(d) === selectedDateKey,
  );

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
        Loading your journal…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Activity journal</h2>
          <p className="text-sm text-slate-500">
            Add a note and photo for any of the last 7 days
          </p>
        </div>
        {status && (
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            {status}
          </span>
        )}
      </div>

      {/* Recent days */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Recent days
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {recentDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const entry = store[dateKey];
            const hasNote = Boolean(entry?.note?.trim());
            const hasImage = Boolean(entry?.imageDataUrl);
            const isSelected = dateKey === selectedDateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                className={`shrink-0 rounded-xl px-3 py-2 text-left transition ${
                  isSelected
                    ? "bg-[#E11D48] text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-rose-200"
                }`}
              >
                <span className="block text-xs font-semibold">
                  {formatDayLabel(date, index)}
                </span>
                <span
                  className={`flex gap-1 mt-1 text-[10px] ${
                    isSelected ? "text-rose-100" : "text-slate-400"
                  }`}
                >
                  {hasNote && <span>note</span>}
                  {hasImage && <span>photo</span>}
                  {!hasNote && !hasImage && <span>empty</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-sm font-medium text-slate-700">
          {selectedIndex >= 0
            ? formatDayLabel(recentDays[selectedIndex], selectedIndex)
            : "Selected day"}
        </p>

        {/* Image */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Image
          </label>
          {imageDataUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-64 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Activity for selected day"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 text-xs font-medium bg-white/90 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 hover:bg-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 px-6 py-10 cursor-pointer hover:bg-rose-50/50 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-rose-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                />
              </svg>
              <span className="text-sm font-medium text-rose-600">
                Upload a photo
              </span>
              <span className="text-xs text-slate-400">PNG, JPG up to 2 MB</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          )}
          {imageDataUrl && (
            <label className="mt-2 inline-block text-sm font-medium text-rose-600 cursor-pointer hover:text-rose-700">
              Replace image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Note */}
        <div>
          <label
            htmlFor="activity-note"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Note
          </label>
          <textarea
            id="activity-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="What did you do on this day? Habits, wins, reflections…"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-y min-h-[100px]"
          />
          <p className="mt-1 text-xs text-slate-400">
            Saves automatically when you click away
          </p>
        </div>
      </div>
    </div>
  );
}
