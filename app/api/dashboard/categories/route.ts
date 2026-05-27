import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/connectToDB";
import Category from "@/app/Models/CategorySchema";
import Task from "@/app/Models/TaskSchema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const categories = await Category.find({ clerkId: userId })
    .select("-__v -_id -createdAt -updatedAt")
    .lean();

  return Response.json({ categories });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const color = typeof body.color === "string" ? body.color.trim() : "#7c3aed";

  if (!name) {
    return Response.json({ error: "Category name is required" }, { status: 400 });
  }

  await connectToDB();

  const category = await Category.create({
    clerkId: userId,
    name,
    color,
  });

  return Response.json({ category: { id: category.id, name: category.name, color: category.color } });
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

  const categoryId = typeof body.id === "string" ? body.id : "";
  if (!categoryId) {
    return Response.json({ error: "Category id is required" }, { status: 400 });
  }

  await connectToDB();
  const category = await Category.findOneAndDelete({ clerkId: userId, id: categoryId }).lean();

  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  await Task.deleteMany({ clerkId: userId, categoryId });

  return Response.json({ id: categoryId });
}
