import connectToDB from "./connectToDB";
import Reward from "../app/Models/RewardSchema";
import Task from "../app/Models/TaskSchema";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "./dateUtils";

type RewardType = "daily_bonus" | "weekly_bonus" | "streak_bonus" | "high_completion_bonus";

async function ensureDB() {
  await connectToDB();
}

function productivityFromTasks(tasks: { weight: number; completed: boolean }[]) {
  const total = tasks.reduce((s, t) => s + (t.weight ?? 0), 0);
  if (total === 0) return 0;
  const completed = tasks.reduce((s, t) => s + ((t.completed ? t.weight : 0) ?? 0), 0);
  return (completed / total) * 100;
}

export async function calculateProductivityForDate(clerkId: string, date: string) {
  await ensureDB();
  const tasks = await Task.find({ clerkId, date }).lean();
  return productivityFromTasks(tasks as any);
}

export async function calculateDailyBonus(clerkId: string, date: string) {
  const productivity = await calculateProductivityForDate(clerkId, date);
  const p = Math.round(productivity);
  let amount = 0;
  if (p >= 70 && p <= 74) amount = 20;
  else if (p >= 75 && p <= 79) amount = 25;
  else if (p >= 80 && p <= 84) amount = 35;
  else if (p >= 85 && p <= 89) amount = 40;
  else if (p >= 90 && p <= 100) amount = 50;

  if (amount === 0) return null;

  // prevent duplicates for same day (use UTC midnight marker for stable representation)
  const targetDate = new Date(date + "T00:00:00.000Z");

  const exists = await Reward.findOne({
    clerkId,
    type: "daily_bonus",
    achievedAt: targetDate,
  });
  if (exists) return null;

  const reward = await Reward.create({
    clerkId,
    type: "daily_bonus",
    amount,
    productivity: p,
    achievedAt: targetDate,
    acknowledged: false,
  });
  return reward;
}

function startOfDay(d: Date) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

export async function calculateWeeklyBonus(clerkId: string, weekEndDate: string) {
  // weekEndDate is ISO date string for the week end date (in Bangladesh timezone format)
  await ensureDB();
  
  // Calculate week start and end dates in a 100% timezone-safe manner using UTC methods
  const endDate = new Date(weekEndDate + "T00:00:00.000Z");
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 6);
  
  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  console.log('[calculateWeeklyBonus] Input weekEndDate:', weekEndDate);
  console.log('[calculateWeeklyBonus] Parsed dates - start:', startDateStr, 'end:', endDateStr);

  // Get all tasks for the 7-day window (matching frontend calculation)
  const weekTasks = await Task.find({
    clerkId,
    date: {
      $gte: startDateStr,
      $lte: endDateStr,
    },
  }).lean();

  console.log('[calculateWeeklyBonus] Found tasks count:', weekTasks.length);
  console.log('[calculateWeeklyBonus] Task details:', weekTasks.map((t: any) => ({ date: t.date, completed: t.completed, weight: t.weight })));

  if (weekTasks.length === 0) {
    console.log('[calculateWeeklyBonus] No tasks found, returning null');
    return null;
  }

  // Calculate productivity using same formula as frontend:
  // (total completed weight) / (total weight) × 100
  const totalWeight = (weekTasks as any[]).reduce((sum: number, task: any) => sum + (task.weight ?? 0), 0);
  if (totalWeight === 0) {
    console.log('[calculateWeeklyBonus] Total weight is 0, returning null');
    return null;
  }

  const completedWeight = (weekTasks as any[])
    .filter((task: any) => task.completed)
    .reduce((sum: number, task: any) => sum + (task.weight ?? 0), 0);

  const p = Math.round((completedWeight / totalWeight) * 100);

  console.log('[calculateWeeklyBonus] Weights - total:', totalWeight, 'completed:', completedWeight, 'productivity:', p);

  let amount = 0;
  if (p >= 70 && p <= 74) amount = 100;
  else if (p >= 75 && p <= 79) amount = 120;
  else if (p >= 80 && p <= 84) amount = 150;
  else if (p >= 85 && p <= 89) amount = 170;
  else if (p >= 90 && p <= 94) amount = 180;
  else if (p >= 95 && p <= 100) amount = 200;

  console.log('[calculateWeeklyBonus] Productivity %:', p, 'Bonus amount:', amount);

  if (amount === 0) {
    console.log('[calculateWeeklyBonus] Amount is 0 (productivity < 70%), returning null');
    return null;
  }

  // prevent duplicates for same week (use UTC midnight week end date marker)
  const weekMarker = endDate;
  const exists = await Reward.findOne({ clerkId, type: "weekly_bonus", achievedAt: weekMarker });
  
  console.log('[calculateWeeklyBonus] Week marker:', weekMarker, 'Existing reward found:', !!exists);
  
  if (exists) {
    console.log('[calculateWeeklyBonus] Duplicate reward exists, returning null');
    return null;
  }

  const reward = await Reward.create({
    clerkId,
    type: "weekly_bonus",
    amount,
    productivity: p,
    achievedAt: weekMarker,
    acknowledged: false,
  });
  
  console.log('[calculateWeeklyBonus] Created reward:', reward);
  
  return reward;
}

export async function calculateStreakReward(clerkId: string) {
  await ensureDB();
  // compute consecutive days up to yesterday/today where productivity >= 100%
  // We'll compute up to today inclusive
  let streak = 0;
  const today = startOfDay(new Date());
  // walk backwards until productivity <100 or no tasks
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const p = Math.round(await calculateProductivityForDate(clerkId, iso));
    if (p >= 100) streak++; else break;
    if (i > 365) break; // safety
  }

  // determine milestone
  const milestones: Record<number, number> = { 15: 250, 30: 500, 45: 1200, 60: 2500 };
  const achievedMilestones = Object.keys(milestones)
    .map((k) => Number(k))
    .filter((m) => streak >= m)
    .sort((a, b) => a - b);

  if (achievedMilestones.length === 0) return null;

  // pick highest milestone not yet awarded
  for (let i = achievedMilestones.length - 1; i >= 0; i--) {
    const m = achievedMilestones[i];
    const amount = milestones[m];
    const milestoneKey = `${m}_day_streak`;
    const exists = await Reward.findOne({ clerkId, type: "streak_bonus", milestone: milestoneKey });
    if (exists) continue;
    const reward = await Reward.create({
      clerkId,
      type: "streak_bonus",
      amount,
      milestone: milestoneKey,
      achievedAt: new Date(),
      acknowledged: false,
    });
    return reward;
  }

  return null;
}

export async function calculateHighCompletionReward(clerkId: string) {
  await ensureDB();
  // Count days where productivity >= 80% across all recorded task dates
  const dates = await Task.find({ clerkId }).distinct("date");
  let count = 0;
  for (const date of dates as string[]) {
    const p = Math.round(await calculateProductivityForDate(clerkId, date));
    if (p >= 80) count++;
  }

  const milestones: Record<number, number> = { 10: 100, 15: 150, 20: 200, 25: 250 };
  const achieved = Object.keys(milestones)
    .map((k) => Number(k))
    .filter((m) => count >= m)
    .sort((a, b) => a - b);

  if (achieved.length === 0) return null;

  for (let i = achieved.length - 1; i >= 0; i--) {
    const m = achieved[i];
    const key = `${m}_days_80_plus`;
    const exists = await Reward.findOne({ clerkId, type: "high_completion_bonus", milestone: key });
    if (exists) continue;
    const reward = await Reward.create({
      clerkId,
      type: "high_completion_bonus",
      amount: milestones[m],
      milestone: key,
      achievedAt: new Date(),
      acknowledged: false,
    });
    return reward;
  }

  return null;
}

export async function generateReward(reward: Partial<{ clerkId: string; type: RewardType; amount: number; productivity?: number; milestone?: string; achievedAt?: Date; }>) {
  await ensureDB();
  if (!reward.clerkId || !reward.type || !reward.amount) throw new Error("Missing fields");
  // basic duplicate protection: same clerkId + type + milestone
  const exists = reward.milestone
    ? await Reward.findOne({ clerkId: reward.clerkId, type: reward.type, milestone: reward.milestone })
    : null;
  if (exists) return null;
  const doc = await Reward.create({
    clerkId: reward.clerkId,
    type: reward.type,
    amount: reward.amount,
    productivity: reward.productivity,
    milestone: reward.milestone,
    achievedAt: reward.achievedAt ?? new Date(),
    acknowledged: false,
  } as any);
  return doc;
}

export async function markRewardAsAcknowledged(rewardId: string, clerkId: string) {
  await ensureDB();
  const r = await Reward.findOneAndUpdate({ _id: rewardId, clerkId }, { acknowledged: true }, { new: true });
  return r;
}

export async function getPendingRewards(clerkId: string) {
  await ensureDB();
  const list = await Reward.find({ clerkId, acknowledged: false }).sort({ achievedAt: 1 }).lean();
  return list;
}

export async function calculateLifetimeEarnings(clerkId: string) {
  await ensureDB();
  const agg = await Reward.aggregate([
    { $match: { clerkId, acknowledged: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return (agg[0] && agg[0].total) || 0;
}

export default {
  calculateDailyBonus,
  calculateWeeklyBonus,
  calculateStreakReward,
  calculateHighCompletionReward,
  generateReward,
  markRewardAsAcknowledged,
  getPendingRewards,
  calculateLifetimeEarnings,
};
