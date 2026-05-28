export const BANGALADESH_TIME_ZONE = "Asia/Dhaka";

export function formatDateToBangladeshYMD(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGALADESH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseBangladeshYMD(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.toLocaleString("en-US", { timeZone: BANGALADESH_TIME_ZONE }));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+06:00`);
  }
  return new Date(value);
}

export function getBangladeshYear(date: Date = new Date()) {
  return new Date(date.toLocaleString("en-US", { timeZone: BANGALADESH_TIME_ZONE })).getFullYear();
}

export function getBangladeshWeekday(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BANGALADESH_TIME_ZONE,
    weekday: "long",
  }).format(parseBangladeshYMD(date));
}

export function getBangladeshShortWeekday(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BANGALADESH_TIME_ZONE,
    weekday: "short",
  }).format(parseBangladeshYMD(date));
}
