import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as rewards from "../../../../lib/rewards";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const list = await rewards.getPendingRewards(userId);
    return NextResponse.json({ pending: list }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
