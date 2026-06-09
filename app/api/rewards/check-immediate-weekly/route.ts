import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as rewards from "../../../../lib/rewards";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const body = await req.json().catch(() => ({}));
    const weekEndDate = (body.weekEndDate as string) ?? new Date().toISOString().slice(0, 10);

    // Verify that weekEndDate is a Saturday (day 6 in UTC)
    const dateObj = new Date(weekEndDate + "T00:00:00.000Z");
    const dayOfWeek = dateObj.getUTCDay();
    
    if (dayOfWeek !== 6) {
      return NextResponse.json({ 
        ok: false, 
        message: `Week end date must be Saturday (day 6). Got day ${dayOfWeek} instead.`,
      }, { status: 400 });
    }

    const created: any[] = [];
    
    const weekly = await rewards.calculateWeeklyBonus(userId, weekEndDate);
    if (weekly) created.push(weekly);

    const streak = await rewards.calculateStreakReward(userId);
    if (streak) created.push(streak);
    
    const high = await rewards.calculateHighCompletionReward(userId);
    if (high) created.push(high);

    return NextResponse.json({ ok: true, created }, { status: 200 });
  } catch (err: any) {
    console.error('check-immediate-weekly error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
