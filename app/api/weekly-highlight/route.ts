import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import WeeklyHighlight from "@/app/Models/WeeklyHighlightSchema";
import { getWeekKey } from "@/lib/weekKey";

type WeeklyNotes = {
  study: string;
  dailyWork: string;
  health: string;
};

function notesFromDoc(doc: {
  study?: string;
  dailyWork?: string;
  health?: string;
  note?: string;
} | null): WeeklyNotes {
  return {
    study: doc?.study ?? doc?.note ?? "",
    dailyWork: doc?.dailyWork ?? "",
    health: doc?.health ?? "",
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const weekKey = getWeekKey();
  const doc = await WeeklyHighlight.findOne({ clerkId: userId, weekKey }).lean();

  return Response.json({
    weekKey,
    ...notesFromDoc(doc),
    imageDataUrl: doc?.imageDataUrl || undefined,
  });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    study?: string;
    dailyWork?: string;
    health?: string;
    imageDataUrl?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const study = typeof body.study === "string" ? body.study : "";
  const dailyWork = typeof body.dailyWork === "string" ? body.dailyWork : "";
  const health = typeof body.health === "string" ? body.health : "";
  const imageDataUrl =
    body.imageDataUrl === null || body.imageDataUrl === undefined
      ? ""
      : typeof body.imageDataUrl === "string"
        ? body.imageDataUrl
        : "";

  if (imageDataUrl.length > 3_000_000) {
    return Response.json({ error: "Image too large" }, { status: 400 });
  }

  await connectToDB();
  const weekKey = getWeekKey();

  const doc = await WeeklyHighlight.findOneAndUpdate(
    { clerkId: userId, weekKey },
    {
      $set: { study, dailyWork, health, imageDataUrl },
      $unset: { note: "" },
    },
    { upsert: true, returnDocument: "after", lean: true },
  );

  const notes = notesFromDoc(doc);

  return Response.json({
    weekKey,
    ...notes,
    imageDataUrl: doc?.imageDataUrl || imageDataUrl || undefined,
  });
}
