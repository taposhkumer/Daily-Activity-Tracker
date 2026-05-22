export type DayEntry = {
  note: string;
  imageDataUrl?: string;
};

export type ActivityJournalStore = Record<string, DayEntry>;

const STORAGE_PREFIX = "daily-activity-journal";

export function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getRecentDays(count = 7): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  return days;
}

export function formatDayLabel(date: Date, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function loadJournal(userId: string): ActivityJournalStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as ActivityJournalStore;
  } catch {
    return {};
  }
}

export function saveJournal(userId: string, store: ActivityJournalStore) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(store));
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image must be smaller than 2 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}
