"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { readImageAsDataUrl } from "@/lib/activityJournal";
import { formatWeekLabel } from "@/lib/weekKey";

export default function Hero() {
  const { isSignedIn, isLoaded } = useUser();
  const [study, setStudy] = useState("");
  const [dailyWork, setDailyWork] = useState("");
  const [health, setHealth] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [weekKey, setWeekKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const notesRef = useRef({ study: "", dailyWork: "", health: "" });

  const showStatus = useCallback((message: string) => {
    setStatus(message);
    const t = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(t);
  }, []);

  const loadHighlight = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/weekly-highlight");
      if (!res.ok) throw new Error("Could not load your weekly highlight");
      const data = (await res.json()) as {
        weekKey: string;
        study: string;
        dailyWork: string;
        health: string;
        imageDataUrl?: string;
      };
      setWeekKey(data.weekKey);
      const loadedStudy = data.study ?? "";
      const loadedDailyWork = data.dailyWork ?? "";
      const loadedHealth = data.health ?? "";
      notesRef.current = {
        study: loadedStudy,
        dailyWork: loadedDailyWork,
        health: loadedHealth,
      };
      setStudy(loadedStudy);
      setDailyWork(loadedDailyWork);
      setHealth(loadedHealth);
      setImageDataUrl(data.imageDataUrl || undefined);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [showStatus]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadHighlight();
  }, [isLoaded, isSignedIn, loadHighlight]);

  const saveToDb = useCallback(
    async (payload: {
      study: string;
      dailyWork: string;
      health: string;
      imageDataUrl?: string | null;
    }) => {
      setIsSaving(true);
      try {
        const res = await fetch("/api/weekly-highlight", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Save failed");
        }
        const data = (await res.json()) as {
          weekKey: string;
          study: string;
          dailyWork: string;
          health: string;
          imageDataUrl?: string;
        };
        setWeekKey(data.weekKey);
        const savedStudy = data.study ?? "";
        const savedDailyWork = data.dailyWork ?? "";
        const savedHealth = data.health ?? "";
        notesRef.current = {
          study: savedStudy,
          dailyWork: savedDailyWork,
          health: savedHealth,
        };
        setStudy(savedStudy);
        setDailyWork(savedDailyWork);
        setHealth(savedHealth);
        setImageDataUrl(data.imageDataUrl || undefined);
        showStatus("Saved to database");
      } catch (err) {
        showStatus(err instanceof Error ? err.message : "Could not save");
      } finally {
        setIsSaving(false);
      }
    },
    [showStatus],
  );

  const currentNotesPayload = useCallback(
    () => ({
      study: notesRef.current.study,
      dailyWork: notesRef.current.dailyWork,
      health: notesRef.current.health,
      imageDataUrl: imageDataUrl ?? null,
    }),
    [imageDataUrl],
  );

  const handleNotesBlur = () => {
    if (!isSignedIn) return;
    saveToDb(currentNotesPayload());
  };

  const updateStudy = (value: string) => {
    notesRef.current.study = value;
    setStudy(value);
  };

  const updateDailyWork = (value: string) => {
    notesRef.current.dailyWork = value;
    setDailyWork(value);
  };

  const updateHealth = (value: string) => {
    notesRef.current.health = value;
    setHealth(value);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isSignedIn) return;

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setImageDataUrl(dataUrl);
      await saveToDb({ ...currentNotesPayload(), imageDataUrl: dataUrl });
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Could not add image");
    }
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImageDataUrl(undefined);
    if (isSignedIn) {
      saveToDb({ ...currentNotesPayload(), imageDataUrl: null });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-rose-50/30 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
            Now Live: Daily Activity Tracker v1.0
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-tight">
            Master your day, <br />
            <span className="text-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              one stack at a time.
            </span>
          </h1>

          <p className="text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
            Log notes and photos for the last 7 days. Look back at what you did,
            how you felt, and keep your streak alive.
          </p>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="rounded-xl bg-[#E11D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition duration-200"
            >
              Start Stacking Free
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-2 group hover:text-rose-600 transition duration-200"
            >
              Open journal
              <span
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-full max-w-md lg:max-w-none rounded-2xl bg-white p-3 shadow-xl shadow-rose-100/40 border border-slate-100">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  This week&apos;s highlight
                </p>
                <p className="text-[10px] text-slate-400">
                  {weekKey
                    ? formatWeekLabel(weekKey)
                    : "Your most important activity"}
                </p>
              </div>
              {status && (
                <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {status}
                </span>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-4">
              {!isLoaded ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Loading…
                </p>
              ) : !isSignedIn ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-slate-600">
                    Sign in to save your weekly note and photo to the database.
                  </p>
                  <Link
                    href="/sign-in"
                    className="inline-block rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Sign in
                  </Link>
                </div>
              ) : isLoading ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Loading your highlight…
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Image · this week
                    </label>
                    {imageDataUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageDataUrl}
                          alt="This week's activity"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={isSaving}
                          className="absolute top-2 right-2 text-[10px] font-medium bg-white/90 text-slate-700 px-2 py-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-rose-200 bg-rose-50/40 aspect-[16/10] cursor-pointer hover:bg-rose-50/60 transition">
                        <span className="text-[11px] font-medium text-rose-600">
                          Upload a photo
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PNG, JPG up to 2 MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          disabled={isSaving}
                        />
                      </label>
                    )}
                    {imageDataUrl && (
                      <label className="mt-1.5 inline-block text-[11px] font-medium text-rose-600 cursor-pointer hover:text-rose-700">
                        Replace image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          disabled={isSaving}
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      Note · week&apos;s most important activity
                    </p>

                    <div>
                      <label
                        htmlFor="weekly-study"
                        className="block text-sm font-medium text-slate-900 mb-1"
                      >
                        1. Study
                      </label>
                      <textarea
                        id="weekly-study"
                        value={study}
                        onChange={(e) => updateStudy(e.target.value)}
                        onBlur={handleNotesBlur}
                        disabled={isSaving}
                        placeholder="Classes, reading, exams, skills…"
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-y min-h-[56px] disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="weekly-dailywork"
                        className="block text-sm font-medium text-slate-900 mb-1"
                      >
                        2. Daily work
                      </label>
                      <textarea
                        id="weekly-dailywork"
                        value={dailyWork}
                        onChange={(e) => updateDailyWork(e.target.value)}
                        onBlur={handleNotesBlur}
                        disabled={isSaving}
                        placeholder="Job tasks, projects, chores, goals…"
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-y min-h-[56px] disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="weekly-health"
                        className="block text-sm font-medium text-slate-900 mb-1"
                      >
                        3. Health
                      </label>
                      <textarea
                        id="weekly-health"
                        value={health}
                        onChange={(e) => updateHealth(e.target.value)}
                        onBlur={handleNotesBlur}
                        disabled={isSaving}
                        placeholder="Workouts, sleep, nutrition, wellness…"
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-y min-h-[56px] disabled:opacity-60"
                      />
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Each section saves to MongoDB when you click away. Edit
                      anytime this week.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
