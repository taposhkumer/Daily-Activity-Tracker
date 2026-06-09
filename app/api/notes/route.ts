import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import Note from "@/app/Models/NoteSchema";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const url = new URL(req.url);
    const period = url.searchParams.get("period");

    const query: any = { clerkId: userId };
    if (period && ["week", "month", "year"].includes(period)) {
      query.period = period;
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ notes }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/notes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const body = await req.json();
    const { title, content, period, imageUrl } = body;

    if (!title || !period || !["week", "month", "year"].includes(period)) {
      return NextResponse.json(
        { error: "Missing required fields: title, period" },
        { status: 400 }
      );
    }

    const note = await Note.create({
      clerkId: userId,
      title,
      content: content || "",
      period,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/notes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const body = await req.json();
    const { id, title, content, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, clerkId: userId },
      {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/notes error:", err);
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
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const note = await Note.findOneAndDelete({ _id: id, clerkId: userId });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/notes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
