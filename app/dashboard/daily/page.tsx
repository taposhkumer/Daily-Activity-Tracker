import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/connectToDB";
import CategoryModel from "@/app/Models/CategorySchema";
import TaskModel from "@/app/Models/TaskSchema";
import Sidebar from "@/app/components/SideBar/Sidebar";
import DailyOverviewClient from "@/app/components/dashboard/daily-overview/DailyOverviewClient";
import { type Category, type Task } from "@/Types/DashboardTypes";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "@/lib/dateUtils";

export const metadata = {
  title: "Daily Overview - Productivity Intelligence Dashboard",
  description: "Premium daily productivity overview with streak analytics and calendar visualization",
};

export default async function DailyOverviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDB();

  // Fetch categories
  const categoriesData = await CategoryModel.find({ clerkId: userId })
    .select("-__v -_id -createdAt -updatedAt")
    .lean();

  const categories: Category[] = categoriesData.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
  }));

  // Fetch all tasks
  const allTasksData = await TaskModel.find({ clerkId: userId })
    .select("-__v -createdAt -updatedAt")
    .lean();

  // Get today's date in Bangladesh timezone
  const today = formatDateToBangladeshYMD(parseBangladeshYMD(new Date()));
  
  // Get today's tasks - compare date strings
  const todayTasksData = allTasksData.filter((task: any) => {
    const taskDate = typeof task.date === "string" ? task.date : String(task.date);
    return taskDate === today;
  });

  // Map to frontend types
  const allTasks: Task[] = allTasksData.map((task: any) => ({
    id: task.id,
    title: task.title,
    weight: task.weight,
    completed: task.completed,
    categoryId: task.categoryId,
    date: task.date,
  }));

  const todayTasks: Task[] = todayTasksData.map((task: any) => ({
    id: task.id,
    title: task.title,
    weight: task.weight,
    completed: task.completed,
    categoryId: task.categoryId,
    date: task.date,
  }));

  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar />
      <main className="flex-1">
        <DailyOverviewClient
          tasks={todayTasks}
          allTasks={allTasksData}
          categories={categories}
        />
      </main>
    </div>
  );
}
