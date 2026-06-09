import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import Goal from "@/app/Models/GoalSchema";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const url = new URL(req.url);
    const period = url.searchParams.get("period"); // Optional filter

    const query: any = { clerkId: userId };
    if (period && ["week", "month", "year"].includes(period)) {
      query.period = period;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ goals }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/goals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const body = await req.json();
    const { title, description, period, imageUrl } = body;

    if (!title || !period || !["week", "month", "year"].includes(period)) {
      return NextResponse.json(
        { error: "Missing required fields: title, period" },
        { status: 400 }
      );
    }

    const goal = await Goal.create({
      clerkId: userId,
      title,
      description: description || "",
      period,
      imageUrl: imageUrl || null,
      completed: false,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/goals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const body = await req.json();
    const { id, title, description, imageUrl, completed } = body;

    if (!id) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, clerkId: userId },
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(completed !== undefined && {
          completed,
          completedAt: completed ? new Date() : null,
        }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ goal }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/goals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const goal = await Goal.findOneAndDelete({ _id: id, clerkId: userId });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/goals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
