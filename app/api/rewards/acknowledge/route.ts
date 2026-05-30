import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as rewards from "../../../../lib/rewards";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { rewardId } = body as { rewardId?: string };
    if (!rewardId) return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
    const updated = await rewards.markRewardAsAcknowledged(rewardId, userId);
    if (!updated) return NextResponse.json({ error: "Not found or not owned" }, { status: 404 });
    return NextResponse.json({ ok: true, reward: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
