/** Sunday of the current week (local), as YYYY-MM-DD */
export function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const sundayOffset = day === 0 ? 0 : -day;
  d.setDate(d.getDate() + sundayOffset);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekKey: string) {
  const start = new Date(`${weekKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}
