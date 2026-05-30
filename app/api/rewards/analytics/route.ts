import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "../../../../lib/connectToDB";
import Task from "../../../Models/TaskSchema";
import Reward from "../../../Models/RewardSchema";

async function productivityForDate(clerkId: string, date: string) {
  const tasks = await Task.find({ clerkId, date }).lean();
  const total = tasks.reduce((s: number, t: any) => s + (t.weight ?? 0), 0);
  if (total === 0) return 0;
  const completed = tasks.reduce((s: number, t: any) => s + ((t.completed ? t.weight : 0) ?? 0), 0);
  return (completed / total) * 100;
}

function startOfDay(d: Date) { const s = new Date(d); s.setHours(0,0,0,0); return s; }

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const clerkId = userId;
    await connectToDB();

    const pendingCount = await Reward.countDocuments({ clerkId, acknowledged: false });
    const lifetimeAgg = await Reward.aggregate([{ $match: { clerkId, acknowledged: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    const lifetime = (lifetimeAgg[0] && lifetimeAgg[0].total) || 0;

    // count 80%+ days and compute current and best streaks over distinct dates
    const dates = await Task.find({ clerkId }).distinct('date');
    const dateList = (dates as string[]).sort();
    let count80 = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;
    const todayIso = new Date().toISOString().slice(0,10);

    for (let i = 0; i < dateList.length; i++) {
      const date = dateList[i];
      const p = Math.round(await productivityForDate(clerkId, date));
      if (p >= 80) count80++;
      if (p >= 100) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // compute current streak ending today
    for (let i = 0; ; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      const p = Math.round(await productivityForDate(clerkId, iso));
      if (p >= 100) currentStreak++; else break;
      if (i > 365) break;
    }

    // today's and this week's bonus (not acknowledged necessarily)
    const todayIso = new Date().toISOString().slice(0,10);
    const todayReward = await Reward.findOne({ clerkId, type: 'daily_bonus', achievedAt: { $gte: startOfDay(new Date(todayIso)), $lte: new Date() } }).lean();
    // week end = today (caller can schedule Friday)
    const weekEnd = startOfDay(new Date());
    const weekReward = await Reward.findOne({ clerkId, type: 'weekly_bonus', achievedAt: weekEnd }).lean();

    return NextResponse.json({ currentStreak, bestStreak, todaysBonus: todayReward || null, thisWeekBonus: weekReward || null, count80Days: count80, lifetimeEarned: lifetime, pending: pendingCount }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
