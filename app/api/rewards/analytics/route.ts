import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "../../../../lib/connectToDB";
import Task from "../../../Models/TaskSchema";
import Reward from "../../../Models/RewardSchema";
import { formatDateToBangladeshYMD } from "../../../../lib/dateUtils";

async function productivityForDate(clerkId: string, date: string) {
  const tasks = await Task.find({ clerkId, date }).lean();
  const total = tasks.reduce((s: number, t: any) => s + (t.weight ?? 0), 0);
  if (total === 0) return 0;
  const completed = tasks.reduce((s: number, t: any) => s + ((t.completed ? t.weight : 0) ?? 0), 0);
  return (completed / total) * 100;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const clerkId = userId;
    await connectToDB();

    const pendingCount = await Reward.countDocuments({ clerkId, acknowledged: false });
    const lifetimeAgg = await Reward.aggregate([{ $match: { clerkId, acknowledged: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    const lifetime = (lifetimeAgg[0] && lifetimeAgg[0].total) || 0;

    // Get current date in Bangladesh timezone
    const todayIso = formatDateToBangladeshYMD(new Date());

    // count 80%+ days and compute current and best streaks over distinct dates
    const dates = await Task.find({ clerkId }).distinct('date');
    const dateList = (dates as string[]).sort();
    let count80 = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

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

    // compute current streak ending today in Bangladesh timezone
    const currentStreakAnchor = new Date(todayIso + "T00:00:00.000Z");
    for (let i = 0; ; i++) {
      const d = new Date(currentStreakAnchor);
      d.setUTCDate(d.getUTCDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const p = Math.round(await productivityForDate(clerkId, iso));
      if (p >= 100) currentStreak++; else break;
      if (i > 365) break;
    }

    // today's bonus (using stable UTC midnight marker)
    const todayReward = await Reward.findOne({ 
      clerkId, 
      type: 'daily_bonus', 
      achievedAt: new Date(todayIso + "T00:00:00.000Z") 
    }).lean();

    // this week's bonus (check if a weekly_bonus has been achieved within the sliding 7-day window ending today)
    const endD = new Date(todayIso + "T00:00:00.000Z");
    const startD = new Date(endD);
    startD.setUTCDate(startD.getUTCDate() - 6);

    const weekReward = await Reward.findOne({ 
      clerkId, 
      type: 'weekly_bonus', 
      achievedAt: { $gte: startD, $lte: endD } 
    }).lean();

    return NextResponse.json({ 
      currentStreak, 
      bestStreak, 
      todaysBonus: todayReward || null, 
      thisWeekBonus: weekReward || null, 
      count80Days: count80, 
      lifetimeEarned: lifetime, 
      pending: pendingCount 
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
