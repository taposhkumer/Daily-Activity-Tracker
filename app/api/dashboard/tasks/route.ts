import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import Task from "@/app/Models/TaskSchema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const tasks = await Task.find({ clerkId: userId })
    .select("-__v -_id -createdAt -updatedAt")
    .lean();

  return Response.json({ tasks });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    weight?: number;
    categoryId?: string;
    date?: string;
    completed?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const weight = typeof body.weight === "number" ? body.weight : 1;
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const date = typeof body.date === "string" ? body.date : "";
  const completed = typeof body.completed === "boolean" ? body.completed : false;

  if (!title || !categoryId || !date) {
    return Response.json({ error: "Missing required task fields" }, { status: 400 });
  }

  await connectToDB();
  const task = await Task.create({
    clerkId: userId,
    title,
    weight,
    categoryId,
    date,
    completed,
  });

  return Response.json({ task: { id: task.id, title: task.title, weight: task.weight, completed: task.completed, categoryId: task.categoryId, date: task.date } });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    completed?: boolean;
    title?: string;
    weight?: number;
    categoryId?: string;
    date?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return Response.json({ error: "Task id is required" }, { status: 400 });
  }

  await connectToDB();

  const updateFields: Record<string, unknown> = {};
  if (typeof body.title === "string") updateFields.title = body.title.trim();
  if (typeof body.weight === "number") updateFields.weight = body.weight;
  if (typeof body.completed === "boolean") updateFields.completed = body.completed;
  if (typeof body.categoryId === "string") updateFields.categoryId = body.categoryId;
  if (typeof body.date === "string") updateFields.date = body.date;

  const task = await Task.findOneAndUpdate(
    { clerkId: userId, id: body.id },
    { $set: updateFields },
    { returnDocument: "after", lean: true },
  );

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json({ task });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const taskId = typeof body.id === "string" ? body.id : "";
  if (!taskId) {
    return Response.json({ error: "Task id is required" }, { status: 400 });
  }

  await connectToDB();
  const task = await Task.findOneAndDelete({ clerkId: userId, id: taskId }).lean();

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json({ id: taskId });
}
