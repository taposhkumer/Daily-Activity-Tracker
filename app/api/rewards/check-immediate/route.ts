import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as rewards from "../../../../lib/rewards";
import Task from "@/app/Models/TaskSchema";
import Category from "@/app/Models/CategorySchema";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const date = (body.date as string) ?? new Date().toISOString().slice(0, 10);

    const productivity = Math.round(await rewards.calculateProductivityForDate(userId, date));

    const created: any[] = [];

    if (productivity >= 100) {
      // Award perfect day bonus for 100% completion
      const perfectDay = await rewards.calculatePerfectDayBonus(userId, date);
      if (perfectDay) created.push(perfectDay);

      // Check for category-level 100% bonuses
      const categories = await Category.find({ clerkId: userId }).lean();
      for (const cat of categories as any[]) {
        const categoryBonus = await rewards.calculateCategory100Bonus(userId, date, cat._id.toString(), cat.name);
        if (categoryBonus) created.push(categoryBonus);
      }

      // Award daily bonus
      const daily = await rewards.calculateDailyBonus(userId, date);
      if (daily) created.push(daily);

      // Check if today is Saturday (day 6) for weekly bonus
      const dateObj = new Date(date + "T00:00:00.000Z");
      if (dateObj.getUTCDay() === 6) {
        // Saturday - check weekly bonus
        const weekly = await rewards.calculateWeeklyBonus(userId, date);
        if (weekly) created.push(weekly);
      }

      // Check streak and high completion rewards
      const streak = await rewards.calculateStreakReward(userId);
      if (streak) created.push(streak);
      const high = await rewards.calculateHighCompletionReward(userId);
      if (high) created.push(high);
    } else {
      return NextResponse.json({ 
        ok: true, 
        message: `Productivity ${productivity}% — below 100%, no rewards yet`,
        productivity,
      }, { status: 200 });
    }

    return NextResponse.json({ ok: true, created, productivity }, { status: 200 });
  } catch (err: any) {
    console.error('check-immediate error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
