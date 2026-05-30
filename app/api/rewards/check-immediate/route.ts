import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as rewards from "../../../../lib/rewards";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const date = (body.date as string) ?? new Date().toISOString().slice(0, 10);

    const productivity = Math.round(await rewards.calculateProductivityForDate(userId, date));

    if (productivity < 100) {
      return NextResponse.json({ ok: true, message: 'Productivity below 100 — scheduled evaluation will run at 22:00' }, { status: 200 });
    }

    const created: any[] = [];
    const daily = await rewards.calculateDailyBonus(userId, date);
    if (daily) created.push(daily);
    const streak = await rewards.calculateStreakReward(userId);
    if (streak) created.push(streak);
    const high = await rewards.calculateHighCompletionReward(userId);
    if (high) created.push(high);

    return NextResponse.json({ ok: true, created, productivity }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
